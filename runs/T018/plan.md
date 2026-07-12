## Objective

Create a typed frontend API client module in `frontend/src/api/` that exposes one function per CRA operation and surfaces backend errors in a single consistent shape usable by any UI component.

## Included

### Types — `frontend/src/api/types.ts`
- `CraStatus`: `'DRAFT' | 'VALIDATED'`
- `CraDayEntryDto`: `{ day: number; worked: 0 | 0.5 | 1; note: string | null }`
- `CraDetailsDto`: `{ id: number; month: number; year: number; totalWorkedDays: number; status: CraStatus; days: CraDayEntryDto[]; validationDate: string | null; providerSignatureDate: string | null }`
- `CraSummaryDto`: `{ id: number; month: number; year: number; totalWorkedDays: number; status: CraStatus }`
- `CraDayUpdateRequest`: `{ workValue?: 0 | 0.5 | 1 | null; note?: string | null }`
- `ValidateCraRequest`: `{ providerSignatureDate: string }`

### Error type — `frontend/src/api/apiError.ts`
- `ApiErrorCode`: union of known backend error codes (`'invalid_work_value' | 'cra_validated' | 'cra_not_found' | 'cra_day_not_found' | 'network_error' | 'unknown_error'`)
- `ApiError`: class extending `Error` with fields `code: ApiErrorCode`, `httpStatus: number | null`, `detail?: unknown`
- `isApiError(e: unknown): e is ApiError` — type guard

### Base fetch wrapper — `frontend/src/api/httpClient.ts`
- `apiGet<T>(path: string): Promise<T>`, `apiPost<T>(...)`, `apiPatch<T>(...)`, `apiGetBlob(...)` — native fetch wrappers, base URL from `REACT_APP_API_BASE_URL`
- On non-2xx: parse `{ error, ... }` body, map to `ApiError`; fall back to `unknown_error`

### Client functions — `frontend/src/api/craClient.ts`
- `createCra(year, month)` → `POST /api/cra`
- `getCra(id)` → `GET /api/cras/:id`
- `updateDay(craId, date, body)` → `PATCH /api/cras/:craId/days/:date`
- `validateCra(craId, body)` → `POST /api/cras/:craId/validate`
- `listCras()` → `GET /api/cras`
- `downloadCraPdf(craId)` → `GET /api/cras/:craId/pdf`

### Tests — `frontend/src/api/__tests__/craClient.test.ts`
- One test per function (mocked fetch), plus error mapping tests for 400/404/409/network failure

## Excluded

- Calendar UI, History UI, any React component
- Backend implementation of `GET /api/cras`, `GET /api/cras/:id`, `GET /api/cras/:id/pdf` (not yet implemented in backend — client written against expected contract)
- Auth, client signature, state management, frontend bootstrapping

## Acceptance criteria

- All six client functions exported from `craClient.ts`, each calling correct method and path
- `ApiError` thrown for every non-2xx and network failure, `code` matching backend `error` string
- All functions covered by unit tests; tests pass
- No UI, auth, or state management code introduced
- `getCra`, `listCras`, `downloadCraPdf` marked with a comment noting the backend endpoint is pending
