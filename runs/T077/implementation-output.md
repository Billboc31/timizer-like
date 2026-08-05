All changes are confirmed in place. Implementation complete.

---

**Summary of changes:**

### Backend (3 source files)

| File | Change |
|------|--------|
| `ClientSignatureService.java` | `setStatus(FULLY_SIGNED)` → `setStatus(VALIDATED)` — client signature now directly sets the terminal status |
| `CraDetailsMapper.java` | `FULLY_SIGNED → AWAITING_CLIENT_SIGNATURE` → `FULLY_SIGNED → VALIDATED` — safety-net mapping for any legacy DB rows |
| `CraReopenService.java` | Added guard: throws `CraValidatedException` (409) when attempting to reopen a `VALIDATED` or `FULLY_SIGNED` CRA |

### Backend test (1 file)

| File | Change |
|------|--------|
| `CraSignatureWorkflowIntegrationTest.java` | Renamed `reopenAfterBothSignaturesReturnsToDraft` → `reopenAfterClientSignatureReturns409`, updated assertions to expect 409 and `VALIDATED` status |

### Frontend (3 files)

| File | Change |
|------|--------|
| `CraDetailModal.tsx` | Added locked banner "Cette CRA a été définitivement validée par le client." for `VALIDATED`; hides reopen button when `status === 'VALIDATED'` |
| `CraDetailModal.css` | Added `.cra-detail__signed-banner` green-tinted informational style |
| `CraDetailModal.test.tsx` | Added 4 tests: no reopen button for VALIDATED, banner shown for VALIDATED, banner absent for AWAITING |

**Pre-existing failures not caused by this ticket:** `CraDtoTest.craStatusExposesAllWorkflowValues` (CraStatus enum mismatch) and `CraSignatureLinkControllerTest` (ApplicationContext load failure) — both were failing before these changes.
