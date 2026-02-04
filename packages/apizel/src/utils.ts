import type { RequestParams } from './types'

/**
 * baseURL と endpoint を安全に結合する。
 * - baseURL 末尾の / は削る
 * - endpoint は必ず / 始まりにする
 *
 * 例:
 *  joinURL('https://api.example.com/', 'v1/me') => 'https://api.example.com/v1/me'
 */
export const joinURL = (baseURL: string, endpoint: string) => {
  const b = baseURL.replace(/\/+$/, '')
  const e = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${b}${e}`
}

/**
 * params を query string として付与する（v0.0.1）
 * - null/undefined は無視（URLに出さない）
 * - boolean/number/string は String() で文字列化
 * - 配列は repeat 形式（tag=a&tag=b）
 * - object（ネスト等）が来た場合は default: error（throw）
 *
 * NOTE:
 * - arrayFormat のようなオプションは持たない（軽さ優先）
 */
export const withParams = (url: string, params?: RequestParams) => {
  if (!params) return url

  const sp = new URLSearchParams()

  for (const [k, v] of Object.entries(params)) {
    if (v === null || v === undefined) continue

    // repeat format: tag=a&tag=b
    if (Array.isArray(v)) {
      for (const item of v) {
        if (item === null || item === undefined) continue
        sp.append(k, String(item))
      }
      continue
    }

    // object は非対応（静かに壊れる事故を防ぐ）
    if (typeof v === 'object') {
      // URLにはすでにクエリが含まれている可能性があるので、原因が追える最低限の情報を載せる
      throw new Error(`apizel: params object is not supported (key="${k}", url="${url}")`)
    }

    // string/number/boolean
    sp.append(k, String(v))
  }

  const qs = sp.toString()
  if (!qs) return url
  return url.includes('?') ? `${url}&${qs}` : `${url}?${qs}`
}

/**
 * ヘッダーの単純マージ。
 * - 引数を左から順に適用し、同名キーは「後勝ち」
 * - undefined は無視
 *
 * NOTE:
 * - Fetch の Headers オブジェクトではなく、Record<string,string> で扱う方針（軽量）
 * - キーの大文字小文字は呼び出し側の責務（'Content-Type' を統一推奨）
 */
export const mergeHeaders = (...parts: Array<Record<string, string> | undefined>) => {
  const out: Record<string, string> = {}
  for (const p of parts) {
    if (!p) continue
    for (const [k, v] of Object.entries(p)) out[k] = v
  }
  return out
}

/**
 * JSONレスポンス判定。
 * - content-type に application/json を含むかを見る
 */
export const isJsonResponse = (res: Response) => {
  const ct = res.headers.get('content-type') ?? ''
  return ct.includes('application/json')
}

/**
 * レスポンスボディを安全に読む。
 * - 204 は必ず null（ボディなし）
 * - JSON なら res.json()、ただし壊れていたら null にフォールバック
 * - JSON以外は res.text()、失敗したら null
 *
 * NOTE:
 * - 「JSONが壊れてたら例外にする」より、HttpError.data に載せやすい形を優先
 */
export const readBody = async (res: Response): Promise<unknown> => {
  if (res.status === 204) return null
  if (isJsonResponse(res)) {
    try {
      return await res.json()
    } catch {
      return null
    }
  }
  try {
    return await res.text()
  } catch {
    return null
  }
}
