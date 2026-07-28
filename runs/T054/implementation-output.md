All 253 tests pass. 

**Changes made:**

- **`frontend/src/api/httpClient.ts:25-30`** — `handleResponse` now reads the body as text first, returns `undefined` for empty bodies, and `JSON.parse`s non-empty ones. This fixes the `SyntaxError` that was preventing the signing success screen from appearing.

- **`frontend/src/api/__tests__/httpClient.test.ts`** — Updated `mockFetchOk` to use `text()` (matching the new implementation) and added `D8` describe block with two tests: 200 with empty body resolves `undefined`, and 200 with JSON body parses correctly.

- **`frontend/src/api/__tests__/craClient.test.ts:33-41`** — Updated local `mockFetchOk` to use `text()` to stay consistent with the new `handleResponse` contract.
