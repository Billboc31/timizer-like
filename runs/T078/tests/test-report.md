---

## T078 — Test Report

**Verdict: REFUSED**

All 6 acceptance criteria are functionally implemented and both test suites pass (116 backend tests, 285 frontend vitest tests). However, `tsc --noEmit` fails with 21 errors, including two blocking issues in **production** frontend code introduced by this ticket.

---

### Acceptance criteria

| # | Criterion | Status |
|---|---|---|
| AC1 | Edit and persist all 6 provider fields from Settings | ✅ PASS |
| AC2 | Saved values restored after refresh/restart | ✅ PASS |
| AC3 | CRA PDFs contain provider legal information | ✅ PASS |
| AC4 | Obsolete provider fields removed from UI and PDF | ✅ PASS |
| AC5 | Existing data migration handled safely | ✅ PASS |
| AC6 | PDF readable with long/partial values | ✅ PASS |

---

### Blocking issues (must fix)

**1. `ProviderSignatureBox.tsx:41` — wrong property name**

```tsx
{cra.providerSignatureImageUrl && ...}  // property does not exist
```
The type has `providerSignatureImage`, not `providerSignatureImageUrl`. The condition is always falsy — the signature image never renders after signing.

**2. `types/cra.ts:34` — `CraSummaryDto` not in scope**

```ts
export type { CraSummaryDto } from '../api/types';  // re-exports only
export interface CraDetailsDto extends CraSummaryDto { ... }  // ERROR
```
`CraSummaryDto` is re-exported but not imported into local scope. `CraDetailsDto` is structurally broken. Fix: add `import type { CraSummaryDto } from '../api/types';`.

---

### Non-blocking issues (should fix)

- `craClient.test.ts:138` — stale `mockProviderSettings` still uses old field names (`firstName`, `lastName`, etc.)
- `errorMessages.ts:4` — `Record<ApiErrorCode, string>` missing `cra_wrong_status` and `token_not_found`
- 8 test files have fixture objects missing `clientSignatureDate` / `clientRepresentativeName`
- `CalendarGrid.tsx:96` — `cra` accessed without null guard

Full report saved to `runs/T078/prompts/tester-attempt-1.md`.
