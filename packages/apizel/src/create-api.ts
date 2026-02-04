import { HttpError } from './http-error'
import type {
  ApiClient,
  ApizelConfig,
  RequestHookContext,
  RequestMeta,
  RequestOptions,
  ResponseHookContext,
} from './types'
import { joinURL, mergeHeaders, readBody, withParams } from './utils'

/**
 * 内部専用オプション（外部公開しない）
 * - __retried: 401→refresh→retry を「1回だけ」に制限するための保険フラグ
 *   ※ 現実装は request を再帰せず fetch を直接2回叩くが、将来方式変更しても守れるよう残す
 */
type InternalRequestOptions = RequestOptions & {
  __retried?: boolean
}

/**
 * AbortSignal.reason を安全に取り出すための小さな互換レイヤー。
 * - 実行環境差（reason 未実装・型定義差分）をこの関数に隔離し、
 *   リクエスト本体ロジックへ `as any` や分岐を拡散させない。
 * - 将来 reason の仕様差分が出ても、この関数だけ修正すればよい状態を保つ。
 */
const getAbortReason = (signal?: AbortSignal): unknown => {
  if (!signal) return undefined
  if (!('reason' in signal)) return undefined
  return signal.reason
}

/**
 * timeoutMs と AbortSignal を合成する。
 *
 * 目的:
 * - TanStack Query が渡す signal を尊重しつつ、timeout でも abort できるようにする
 *
 * 仕様:
 * - timeoutMs <= 0（または未指定）は「タイムアウト無効」→ signal をそのまま使う
 * - abort は HttpError へ変換しない（AbortError 等をそのまま呼び出し側に返す）
 *
 * 実装メモ:
 * - AbortSignal.any は使わず、幅広い環境で動く構成に寄せる
 * - cleanup を必ず呼ぶ設計（timer と event listener の後始末）
 */
const composeSignal = (signal?: AbortSignal, timeoutMs?: number) => {
  const ms = timeoutMs ?? 0
  if (!ms || ms <= 0) return { signal, cleanup: () => {} }

  // 合成後の signal はこの AbortController が持つ
  const ctrl = new AbortController()

  // 元 signal が既に abort 済みなら、即座に合成側も abort しておく
  if (signal?.aborted) {
    try {
      // reason を引き継げる環境なら引き継ぐ（将来のデバッグに効く）
      ctrl.abort(getAbortReason(signal))
    } catch {
      ctrl.abort()
    }
    return { signal: ctrl.signal, cleanup: () => {} }
  }

  // 元 signal が abort されたら、合成側も abort する（TanStack Query 互換）
  const onAbort = () => {
    try {
      ctrl.abort(getAbortReason(signal))
    } catch {
      ctrl.abort()
    }
  }

  signal?.addEventListener('abort', onAbort, { once: true })

  // timeout 到達時も abort する（HttpError にはせず Abort として扱う）
  const timer = setTimeout(() => {
    try {
      ctrl.abort(new Error('timeout'))
    } catch {
      ctrl.abort()
    }
  }, ms)

  // 後始末（timer と listener を必ず解除する）
  const cleanup = () => {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }

  return { signal: ctrl.signal, cleanup }
}

/**
 * body を fetch の BodyInit 相当へ寄せる（v0.0.1）
 *
 * 目的:
 * - axios からの移行コストを減らすため「最低限の axios 風」挙動に寄せる
 *
 * 仕様:
 * - FormData: そのまま送る（Content-Type は触らない。boundary を壊さないため）
 * - string / URLSearchParams / Blob / ArrayBuffer: そのまま送る
 * - その他: JSON.stringify して送る（Content-Type 未指定なら application/json を補完）
 *
 * 注意:
 * - Content-Type の大小文字や統一は利用側の責務（'Content-Type' 推奨）
 */
const applyBody = (init: RequestInit, headers: Record<string, string>, body: unknown) => {
  // FormData（環境によって存在しない場合があるので typeof でガード）
  const hasFormData = typeof FormData !== 'undefined'
  if (hasFormData && body instanceof FormData) {
    init.body = body
    return
  }

  // string
  if (typeof body === 'string') {
    init.body = body
    return
  }

  // URLSearchParams
  if (typeof URLSearchParams !== 'undefined' && body instanceof URLSearchParams) {
    init.body = body
    return
  }

  // Blob
  if (typeof Blob !== 'undefined' && body instanceof Blob) {
    init.body = body
    return
  }

  // ArrayBuffer
  if (typeof ArrayBuffer !== 'undefined' && body instanceof ArrayBuffer) {
    init.body = body
    return
  }

  // default: JSON
  init.body = JSON.stringify(body)
  if (!headers['Content-Type']) {
    // headers は「base → token → request」後の最終形を使って補完する
    init.headers = mergeHeaders(headers, { 'Content-Type': 'application/json' })
  }
}

/**
 * ブランド入口（推奨）
 * - apizel(config) だけ覚えれば使える、という導線のためのエイリアス
 */
export const apizel = (config: ApizelConfig): ApiClient => createApi(config)

/**
 * 互換/汎用入口（中身は同じ）
 * - 将来 createApi という一般名で使いたいケース（社内規約/移行）向け
 */
export const createApi = (config: ApizelConfig): ApiClient => {
  /**
   * fetch 実装は差し替え可能（Node/React Native/テストなど）
   * - 未指定なら globalThis.fetch を使う
   * - bind して `this` 依存を回避（環境差分の吸収）
   */
  const fetchImpl = config.fetchImpl ?? globalThis.fetch.bind(globalThis)

  // ---- 401 refresh single-flight（同時多発の401を1回のrefreshにまとめる） ----
  /**
   * refreshPromise:
   * - refresh 実行中は同じ Promise に合流させる（多重 refresh を防ぐ）
   */
  let refreshPromise: Promise<string> | null = null

  /**
   * isRefreshing:
   * - refresh 処理中であることを示す
   * - refresh 実装がこの client を使っている場合に無限再帰を避けるためにも使う
   */
  let isRefreshing = false

  /**
   * Authorization 付与判定
   * - デフォルトは「全部付ける」
   * - refresh/login など除外したい場合は利用側で shouldAttachToken を上書きする
   */
  const shouldAttachToken =
    config.shouldAttachToken ??
    ((req: RequestMeta) => {
      return true
    })

  /**
   * refreshOnce:
   * - refresh を「同時に1回だけ」実行する
   * - 既に refresh が走っていれば、その Promise を返して合流する
   */
  const refreshOnce = async (): Promise<string> => {
    if (!config.refresh) throw new Error('refresh() is not configured')
    if (refreshPromise) return refreshPromise

    isRefreshing = true
    refreshPromise = (async () => {
      try {
        // refresh() は「新しいアクセストークン」を返す契約
        return await config.refresh!()
      } finally {
        // 成功/失敗に関わらず single-flight を解除
        refreshPromise = null
        isRefreshing = false
      }
    })()

    return refreshPromise
  }

  /**
   * request:
   * - 全HTTPメソッド共通の処理
   * - DTO は呼び出し側が指定（この層では runtime validation はしない）
   */
  const request = async <DTO>(
    method: string,
    endpoint: string,
    body?: unknown,
    options?: InternalRequestOptions,
  ): Promise<DTO> => {
    // フック/トークン判定に渡す最小メタ
    const meta: RequestMeta = { method, endpoint }

    // baseURL + endpoint + query params（配列は repeat、object は withParams 側で扱う）
    const url = withParams(joinURL(config.baseURL, endpoint), options?.params)

    // headers は「base → token → request」で後勝ち（利用側が上書きできる）
    const baseHeaders = config.headers
    const reqHeaders = options?.headers

    let tokenHeader: Record<string, string> | undefined

    /**
     * canTryRefresh:
     * - refresh が設定されていて、かつ refresh 実行中ではないときだけ true
     * - refresh 中に401が発生しても、さらに refresh を起動しない（無限ループ防止）
     */
    const canTryRefresh = !!config.refresh && !isRefreshing

    // Authorization ヘッダー付与（任意）
    if (config.getAccessToken && shouldAttachToken(meta)) {
      const token = await config.getAccessToken()
      if (token) tokenHeader = { Authorization: `Bearer ${token}` }
    }

    const headers = mergeHeaders(baseHeaders, tokenHeader, reqHeaders)

    // timeoutMs と AbortSignal を合成（後始末が必要なので cleanup を必ず呼ぶ）
    const { signal, cleanup } = composeSignal(options?.signal, options?.timeoutMs)

    const init: RequestInit = { method, headers, signal }

    // GET/DELETE は body を送らない（互換性と慣例）
    if (body !== undefined && method !== 'GET' && method !== 'DELETE') {
      applyBody(init, headers, body)
    }

    // 観測用 hooks（挙動は変えない）
    const onRequest = config.onRequest
    const onResponse = config.onResponse

    try {
      // ---- request hook ----
      const reqCtx: RequestHookContext = { method, endpoint, url, init }
      await onRequest?.(reqCtx)

      // ---- actual request ----
      const res = await fetchImpl(url, init)
      const data = await readBody(res)

      // ---- response hook ----
      const resCtx: ResponseHookContext = {
        method,
        endpoint,
        url,
        init,
        response: res,
        data,
      }
      await onResponse?.(resCtx)

      // 成功時は data を返す（DTO の整合性は利用側に委ねる）
      if (res.ok) return data as DTO

      // ---- 401 refresh -> retry once ----
      /**
       * 401 のときだけ:
       * - refresh → retry を「1回だけ」試す
       * - options.__retried が true の場合は二重リトライしない
       */
      if (res.status === 401 && canTryRefresh && !options?.__retried) {
        try {
          const newToken = await refreshOnce()

          // retry は必ず新トークンを付ける（401時点で認証が必要なリクエストと判断できるため）
          const retryHeaders = mergeHeaders(headers, {
            Authorization: `Bearer ${newToken}`,
          })
          const retryInit: RequestInit = { ...init, headers: retryHeaders }

          // retry も hooks で観測できるようにする
          const retryReqCtx: RequestHookContext = {
            method,
            endpoint,
            url,
            init: retryInit,
          }
          await onRequest?.(retryReqCtx)

          const retryRes = await fetchImpl(url, retryInit)
          const retryData = await readBody(retryRes)

          const retryResCtx: ResponseHookContext = {
            method,
            endpoint,
            url,
            init: retryInit,
            response: retryRes,
            data: retryData,
          }
          await onResponse?.(retryResCtx)

          if (retryRes.ok) return retryData as DTO

          // retry しても失敗 → HttpError
          throw new HttpError({
            status: retryRes.status,
            data: retryData,
            method,
            endpoint,
            url,
            message: `HTTP ${retryRes.status}`,
          })
        } catch (e) {
          // refresh 失敗時の利用側 hook（ログアウト等）
          await config.onRefreshFailed?.()
          throw e
        }
      }

      // 401以外、または refresh 不可、または既に retry 済み → HttpError
      throw new HttpError({
        status: res.status,
        data,
        method,
        endpoint,
        url,
        message: `HTTP ${res.status}`,
      })
    } finally {
      // タイマー/リスナーの解放（メモリリーク/予期せぬabortを防ぐ）
      cleanup()
    }
  }

  /**
   * 公開 API
   * - 各 verb は request() へ委譲し、ロジックを1箇所に集約する（保守性優先）
   */
  return {
    get: (endpoint, options) => request('GET', endpoint, undefined, options),
    delete: (endpoint, options) => request('DELETE', endpoint, undefined, options),
    post: (endpoint, body, options) => request('POST', endpoint, body, options),
    put: (endpoint, body, options) => request('PUT', endpoint, body, options),
    patch: (endpoint, body, options) => request('PATCH', endpoint, body, options),
  }
}
