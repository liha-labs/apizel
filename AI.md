# AI Documentation for apizel

This file provides a structured overview of the `apizel` library for AI agents and developers.

## Library Overview

`apizel` is a thin, type-safe wrapper around the Web standard `fetch` API. It is designed to be lightweight, predictable, and easy to integrate with tools like TanStack Query.

- **Package**: `@liha-labs/apizel`
- **Main Entry**: `packages/apizel/src/index.ts`
- **Philosophy**: fetch-first, minimal, standards-compliant.

## Core Specifications

### 1. Client Creation
```ts
import { apizel } from '@liha-labs/apizel'

const api = apizel({
  baseURL: '...',
  headers: { ... },
  timeoutMs: 10000, // Optional global timeout
})
```

### 2. Body Handling (Axios-like)
- `FormData`, `URLSearchParams`, `Blob`, `ArrayBuffer`, `string` are sent as-is.
- Other objects/arrays are `JSON.stringify`'d and `Content-Type: application/json` is added automatically if missing.

### 3. Query Parameters
- Key-value pairs are appended as query strings.
- Arrays are expanded in repeat format: `tag: ['a', 'b']` -> `?tag=a&tag=b`.
- Nested objects are **not supported** (will throw an error to prevent silent failures).

### 4. Auth & Refresh
- `getAccessToken`: Function to provide the current token.
- `refresh`: 401 response triggers this function once.
- **Single-flight**: Parallel 401s will only trigger one refresh call.

### 5. Error Handling
- Throws `HttpError` for non-2xx responses.
- `HttpError` contains `status`, `data`, `url`, `method`, `endpoint`.
- `timeoutMs` or manual abort throws native **AbortError** (not `HttpError`).

## Development
- Repository: `https://github.com/liha-labs/apizel`
- Published documentation: `https://apizel.liha.dev/`
- AI-optimized documentation: `https://apizel.liha.dev/llms.txt`
