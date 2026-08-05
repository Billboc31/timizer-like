All 294 frontend tests pass across 32 test files. Implementation is complete.

---

## Summary

### Files created (backend)

- `backend/src/main/java/com/timizer/backend/cra/CraNotDeletableException.java` — exception thrown when a CRA in a final status is attempted to be deleted
- `backend/src/main/java/com/timizerlike/cra/service/CraDeleteService.java` — guards deletion to `DRAFT`/`READY_FOR_PROVIDER_SIGNATURE`/`SIGNED_BY_PROVIDER`, then cascades: client signature records → signature token → download tokens → transition events → CRA (which orphan-removes day entries via JPA)
- `backend/src/main/java/com/timizerlike/backend/cra/web/CraDeleteController.java` — `DELETE /api/cras/{id}` → 204 on success, 409 via exception handler if non-deletable

### Files modified (backend)

- `CraClientSignatureRecordRepository.java` — added `deleteAllByCraId`
- `CraDownloadTokenRepository.java` — added `deleteAllByCraId`
- `CraTransitionEventRepository.java` — added `deleteAllByCraId`
- `CraApiExceptionHandler.java` — added handler for `CraNotDeletableException` → 409 `cra_not_deletable`

### Files modified (frontend)

- `api/types.ts` — expanded `CraStatus` with `READY_FOR_PROVIDER_SIGNATURE` and `SIGNED_BY_PROVIDER`
- `api/apiError.ts` — added `cra_not_deletable` error code
- `api/errorMessages.ts` — added messages for `cra_not_deletable`, `cra_wrong_status`, `token_not_found`
- `api/craClient.ts` — added `deleteCra(craId)`
- `App.tsx` — wired `onDeleted` callback on `CraDetailModal` to refresh history and calendar
- `CraHistory.tsx` — added `isCraDeletable`, delete state, delete button per row, error display; updated status label/badge for new statuses
- `CraDetailModal.tsx` — added `isCraDeletable`, `onDeleted` prop, delete state/button/error
- `CraOverview.tsx` — updated status label/badge switches for new statuses
- `CraSignatureStatus.tsx` — added new statuses to `STATUS_CONFIG`
- `types/cra.ts` — changed `CraDetails.status` from inline union to `CraStatus`
- `CraHistory.test.tsx` — added 6 new tests for delete behavior
