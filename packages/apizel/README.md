# apizel

**Thin fetch wrapper for TypeScript.**
標準の `fetch` に、ちょうどいい薄皮。

- TanStack Query friendly (`signal` respected, `timeoutMs` uses Abort)
- Minimal axios-like body handling (FormData passthrough, JSON Content-Type fallback)
- 401 refresh retry (single-flight, retry once)
- Observe-only hooks (`onRequest` / `onResponse`)

## Install

```bash
pnpm add @liha-labs/apizel
# npm i @liha-labs/apizel
# yarn add @liha-labs/apizel
````

## Quick Start

```ts
import { apizel } from '@liha-labs/apizel'

type Me = { id: string; name: string }

const api = apizel({ baseURL: 'https://api.example.com' })

const me = await api.get<Me>('/v1/me')
console.log(me)
```

## Docs

* Documentation:
* Repository: https://github.com/liha-labs/apizel

## License

MIT © 2026 Liha Labs
