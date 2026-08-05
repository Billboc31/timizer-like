---

## Test Report — T079

**Verdict: PASS**

All 6 acceptance criteria are satisfied.

### Criteria results

| Criterion | Status | Evidence |
|---|---|---|
| Delete unsigned/unvalidated CRA from History | **PASS** | `isCraDeletable()` guards button; `deleteCra()` called on confirm |
| Delete from CRA detail/modal view | **PASS** | Same guard, modal closes + `onDeleted()` called on success |
| Confirmation dialog shown | **PASS** | `window.confirm()` with irreversibility warning; cancel aborts |
| CRA disappears after deletion, unrecoverable | **PASS** | Transactional cascade deletes all dependent rows; 404 on GET after |
| Signed/validated CRAs blocked in UI | **PASS** | No delete button for VALIDATED, AWAITING_CLIENT_SIGNATURE, FULLY_SIGNED |
| Signed/validated CRAs blocked via API | **PASS** | Backend 409 with `cra_not_deletable` for NON_DELETABLE statuses |
| Provider/client/project records unaffected | **PASS** | Service deletes only CRA-owned dependent tables |

### Test runs

- **Frontend (Vitest)**: 294/294 pass across 32 files, including 6 new delete-specific tests in `CraHistory.test.tsx`
- **Backend (Maven)**: 230 pass; **2 pre-existing failures** (not caused by T079):
  - `CraDtoTest.craStatusExposesAllWorkflowValues` — test expects 3 `CraStatus` values but T075/T077 added 2 more; T079 did not touch this test or enum
  - `CraSignatureLinkControllerTest` (9 errors) — `TimizerProperties` bean missing in test context; last modified by T071, pre-dating T079

### Non-blocking anomaly

No dedicated backend unit test for `CraDeleteController`/`CraDeleteService`. The deletion cascade and 409 guard are verified by code inspection only, not by automated backend tests. This is a test coverage gap to address separately, but does not block shipment.

Report saved to `runs/T079/tests/test-report.md`.
