# apizel

**Thin fetch wrapper for TypeScript.**

標準の `fetch` に、ちょうどいい薄皮。

- ✅ **Small & predictable**: 余計な抽象化なし
- ✅ **TanStack Query friendly**: `signal` を尊重、`timeoutMs` は Abort で中断
- ✅ **Minimal axios-like body**: FormData をそのまま、JSON は `Content-Type` 補完
- ✅ **401 refresh retry**: refresh は single-flight、リトライは 1 回だけ
- ✅ **Observe hooks**: `onRequest` / `onResponse` は観測のみ

> Status: **v0.1.2**
> Design goal: “軽く、標準に沿い、必要なら捨てられる”。

---

## Packages

- `@liha-labs/apizel` (core)

---

## Install

```bash

pnpm add @liha-labs/apizel

# npm i @liha-labs/apizel

# yarn add @liha-labs/apizel

```

---

## Quick Start

```ts

import { apizel } from '@liha-labs/apizel'

type Me = { id: string; name: string }

const api = apizel({
	baseURL: 'https://api.example.com',
})

const me = await api.get<Me>('/v1/me')

console.log(me)
```

---

## Extend Client

共通設定を保ちつつ、`baseURL` などだけを差し替えた派生クライアントを作れます。

```ts
const api = apizel(common)

const usersApi = api.extend({ baseURL: USERS_URL })
const billingApi = api.extend({ baseURL: BILLING_URL })

await usersApi.get('/me')
await billingApi.post('/invoices', body)
```

---

## Usage

### Request options

```ts
await api.get('/v1/items', {
	params: { q: 'hello', tag: ['a', 'b'] }, // => tag=a&tag=b
	timeoutMs: 10_000, // <= 0 disables timeout
	signal, // AbortSignal (TanStack Query compatible)
	headers: { 'X-Trace-Id': '...' },
})
```

### Body (minimal axios-like)

```ts
// JSON (auto sets Content-Type if missing)
await api.post('/v1/items', { name: 'apple' })

// FormData (Content-Type is NOT touched)
const fd = new FormData()
fd.append('file', file)

await api.post('/v1/upload', fd)
```

---

## Errors

Non-2xx responses throw `HttpError`.

```ts
import { HttpError } from '@liha-labs/apizel'

try {
	await api.get('/v1/me')
} catch (e) {
	if (e instanceof HttpError) {
		console.log(e.status, e.data, e.url)
	}
}
```

> Note: abort/timeout errors are **not** converted to `HttpError`.
> You’ll receive the native `AbortError` (or environment equivalent).

---

## Auth Token

```ts
const api = apizel({
	baseURL: 'https://api.example.com',
	getAccessToken: () => localStorage.getItem('token'),
	shouldAttachToken: ({ endpoint }) => !endpoint.startsWith('/auth/'),
})
```

---

## Refresh on 401

* refresh is **single-flight**
* retry is **once**

```ts

const api = apizel({
	baseURL: 'https://api.example.com',
	getAccessToken: async () => getToken(),
	refresh: async () => {
		const newToken = await refreshToken()
		return newToken
	},
	onRefreshFailed: async () => {
	// logout / clear tokens / notify...
	},
})
```

---

## Hooks (observe only)

```ts
const api = apizel({
	baseURL: 'https://api.example.com',
	onRequest: ({ method, url, init }) => {
		// observe only (no behavior changes)
		console.log('[req]', method, url, init)
	},
	onResponse: ({ method, url, response }) => {
		console.log('[res]', method, url, response.status)
	},
})
```

---

## Documentation

* Docs site: https://apizel.liha.dev/
* API reference: https://github.com/liha-labs/apizel

---

## Contributing

* `pnpm i`
* `pnpm ci`

---

## License

MIT © 2026 Liha Labs
