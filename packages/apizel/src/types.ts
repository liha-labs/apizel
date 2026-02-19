/**
 * fetch互換の関数型（差し替え用）
 * - Node/React Native/テストで fetch 実装を差し込める
 */
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>

/**
 * query params（v0.0.1）
 * - string/number/boolean はそのまま
 * - 配列は repeat 形式で展開する（tag=a&tag=b）
 * - null/undefined は URL へ出さない
 *
 * NOTE:
 * - object（ネスト等）は非対応（default: error）
 */
export type RequestParamValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ReadonlyArray<string | number | boolean>

export type RequestParams = Record<string, RequestParamValue>

/**
 * リクエストごとのオプション
 * - headers: base headers を上書きできる（後勝ち）
 * - params: query string
 * - signal: AbortController 対応（TanStack Query互換）
 * - timeoutMs: タイムアウト（<=0 は無効）。Abort で中断し、HttpError にはしない
 */
export type RequestOptions = {
  headers?: Record<string, string>
  params?: RequestParams
  signal?: AbortSignal
  timeoutMs?: number
}

/**
 * どのリクエストかを示すメタ情報
 * - shouldAttachToken() などの判定に使う
 */
export type RequestMeta = {
  method: string
  endpoint: string
}

/**
 * 観測用フックに渡す最小コンテキスト
 * - init は fetch に渡す RequestInit（観測のみ）
 * - response は実リクエストの Response（観測のみ）
 *
 * NOTE:
 * - hooks は観測のみ（返り値で挙動を変えない）
 */
export type RequestHookContext = {
  method: string
  endpoint: string
  url: string
  init: RequestInit
}

export type ResponseHookContext = {
  method: string
  endpoint: string
  url: string
  init: RequestInit
  response: Response
  data: unknown
}

/**
 * apizel の設定（推奨）
 */
export type ApizelConfig = {
  baseURL?: string
  headers?: Record<string, string>
  fetchImpl?: FetchLike

  // ---- Hooks (observe only) ----
  onRequest?: (ctx: RequestHookContext) => void | Promise<void>
  onResponse?: (ctx: ResponseHookContext) => void | Promise<void>

  // ---- Auth ----
  /**
   * 現在のアクセストークンを取得する。
   * - string | null | Promise<string|null> を許容（ストア/非同期どちらでもOK）
   */
  getAccessToken?: () => string | null | Promise<string | null>

  /**
   * どのリクエストに Authorization を付与するかの判定。
   * - 例: refresh/login には付けない、などアプリ都合で制御
   */
  shouldAttachToken?: (req: RequestMeta) => boolean

  // ---- Refresh ----
  /**
   * 401 のときに実行する refresh。
   * - 成功時は「新しいアクセストークン」を返す
   */
  refresh?: () => Promise<string>

  /**
   * refresh が失敗したときの hook。
   * - 例: ログアウト・トークン削除・通知など
   */
  onRefreshFailed?: () => void | Promise<void>
}

/**
 * 互換のため残す（後方互換）
 * @deprecated use ApizelConfig
 */
export type CreateApiConfig = ApizelConfig

/**
 * 利用側が使う API client
 * - DTO は呼び出し側で指定（runtime validation はこの層ではしない）
 */
export type ApiClient = {
  get: <DTO>(endpoint: string, options?: RequestOptions) => Promise<DTO>
  delete: <DTO>(endpoint: string, options?: RequestOptions) => Promise<DTO>
  post: <DTO>(endpoint: string, body?: unknown, options?: RequestOptions) => Promise<DTO>
  put: <DTO>(endpoint: string, body?: unknown, options?: RequestOptions) => Promise<DTO>
  patch: <DTO>(endpoint: string, body?: unknown, options?: RequestOptions) => Promise<DTO>
  extend: (overrides: Partial<ApizelConfig>) => ApiClient
}
