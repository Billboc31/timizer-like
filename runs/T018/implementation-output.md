Implementation complete. Here's the summary:

## Files created

| File | Purpose |
|---|---|
| `frontend/src/api/types.ts` | DTO interfaces: `CraDetailsDto`, `CraSummaryDto`, `CraDayEntryDto`, `CraDayUpdateRequest`, `ValidateCraRequest`, `CraStatus` |
| `frontend/src/api/apiError.ts` | `ApiError` class + `ApiErrorCode` union + `isApiError` type guard |
| `frontend/src/api/httpClient.ts` | `apiGet`, `apiPost`, `apiPatch`, `apiGetBlob` — native fetch wrappers, base URL from `REACT_APP_API_BASE_URL`, non-2xx responses throw `ApiError` |
| `frontend/src/api/craClient.ts` | Six exported functions: `createCra`, `getCra`, `updateDay`, `validateCra`, `listCras`, `downloadCraPdf`; three pending-backend endpoints are marked with a comment |
| `frontend/src/api/__tests__/craClient.test.ts` | 12 tests: one per function + 6 error-mapping cases (400/409/404/unknown/network) |

## Files modified

| File | Change |
|---|---|
| `frontend/package.json` | Added `vitest` test script; added `vitest`, `@vitest/coverage-v8`, `typescript` dev deps |
| `frontend/vite.config.js` | Added `test: { environment: 'node' }` block for vitest |
| `frontend/tsconfig.json` | New — strict TypeScript config for `src/` |

**12/12 tests pass.** State updated to `IMPLEMENTATION_REVIEW_NEEDED`.
