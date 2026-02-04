/**
 * HTTPエラーを表す例外。
 * - status: HTTP status code
 * - data: readBody() の結果（JSON | text | null）
 * - method/endpoint/url: デバッグ/ログ用
 *
 * NOTE:
 * - v1 では「サーバーのエラー形式」を固定しないため data は unknown
 */
export class HttpError extends Error {
  status: number
  data: unknown
  method: string
  endpoint: string
  url: string

  constructor(args: {
    status: number
    data: unknown
    method: string
    endpoint: string
    url: string
    message?: string
  }) {
    super(args.message ?? `HTTP ${args.status}`)
    this.name = 'HttpError'
    this.status = args.status
    this.data = args.data
    this.method = args.method
    this.endpoint = args.endpoint
    this.url = args.url
  }
}
