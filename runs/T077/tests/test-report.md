---

## Test Report — T077

**All 6 acceptance criteria: PASS**

| AC | Criterion | Status |
|---|---|---|
| AC1 | Successful client signature → `VALIDATED` status | **PASS** |
| AC2 | New status immediately visible in UI and History | **PASS** |
| AC3 | Signed CRA cannot be modified or deleted (UI + API) | **PASS** |
| AC4 | Backend mutation attempts return 409 with clear error | **PASS** |
| AC5 | Signing twice is idempotent, no data corruption | **PASS** |
| AC6 | Unsigned CRAs continue the existing editable workflow | **PASS** |

**Test execution:**
- `CraSignatureWorkflowIntegrationTest`: 11/11 pass — covers day update rejection, reopen rejection, token replay, duplicate validation, concurrent validation
- `ClientSignatureServiceTest`: 7/7 pass — covers happy path to `VALIDATED`, data persistence, consent/signature validation, idempotency
- Frontend (vitest): 291/291 pass across 32 files, including 36 `CraDetailModal` tests (signed banner, reopen button hidden, calendar disabled)
- Full backend suite: 232/242 pass — the 10 failures are the 2 pre-existing issues from T071 (`TimizerProperties` bean missing) and T075 (`CraStatus` count mismatch), neither caused by T077

Report saved to `runs/T077/tests/test-report.md`.
