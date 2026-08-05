## Objective

Add permanent deletion of CRAs that have not yet been client-signed or client-validated, enforced in the backend with a 409 guard on final statuses, and surfaced in both the History page and the CRA detail modal with a confirmation dialog.

## Included

### Backend

**New: `backend/src/main/java/com/timizer/backend/cra/web/CraDeleteController.java`**
- `DELETE /api/cras/{id}` — delegates to `CraDeleteService`, returns 204 No Content on success, 409 Conflict if the CRA is in a non-deletable status.

**New: `backend/src/main/java/com/timizer/backend/cra/CraDeleteService.java`**
- Loads the CRA or throws 404.
- Guards: throws a `CraNotDeletableException` (→ 409) if `status` is `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, or `VALIDATED`.
- Deletes dependent records in order (foreign-key safe):
  1. `CraClientSignatureRecordRepository.deleteAllByCraId(id)`
  2. `CraSignatureTokenRepository.deleteByCraId(id)` (already exists)
  3. `CraDownloadTokenRepository.deleteAllByCraId(id)`
  4. `CraTransitionEventRepository.deleteAllByCraId(id)`
  5. `MonthlyCraReportRepository.delete(cra)` (JPA cascade removes `CraDayEntry` via `orphanRemoval = true`)

**Modify: `backend/src/main/java/com/timizer/backend/cra/CraDownloadTokenRepository.java`**
- Add `void deleteAllByCraId(Long craId)`.

**Modify: `backend/src/main/java/com/timizer/backend/cra/CraClientSignatureRecordRepository.java`**
- Add `void deleteAllByCraId(Long craId)`.

**Modify: `backend/src/main/java/com/timizer/backend/cra/CraTransitionEventRepository.java`**
- Add `void deleteAllByCraId(Long craId)`.

**Modify: `backend/src/main/java/com/timizer/backend/cra/web/CraApiExceptionHandler.java`** (or equivalent handler)
- Map `CraNotDeletableException` → HTTP 409 with a descriptive message.

### Frontend

**Modify: `frontend/src/api/craClient.ts`**
- Add `deleteCra(craId: number): Promise<void>` → `DELETE /api/cras/${craId}` (expect 204).

**Modify: `frontend/src/components/CraHistory/CraHistory.tsx`**
- Add a delete icon/button in each CRA row, visible only when status is `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, or `SIGNED_BY_PROVIDER`.
- On click: open a confirmation dialog clearly stating the action is permanent and cannot be undone.
- On confirm: call `deleteCra(cra.id)`, then trigger a list refresh (via `refreshKey` or equivalent).
- On API error: display an inline error message; do not close the dialog.

**Modify: `frontend/src/components/CraDetailModal/CraDetailModal.tsx`**
- Add a delete button in the action area, visible under the same status condition.
- On click: same confirmation dialog.
- On confirm: call `deleteCra`, close the modal, and call the parent refresh callback.
- On API error: display an error toast/message without closing the modal.

**Add helper** (in an appropriate shared utils or types file, or inline in each component):
- `isCraDeletable(status: CraStatus): boolean` — returns `true` for `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`; `false` for all others.

## Excluded

- No database schema migration — the existing data model covers all dependent tables.
- No soft-delete or archive mechanism; this is hard permanent deletion only.
- Shared provider, client, and project records are not deleted.
- No bulk deletion of multiple CRAs.
- No admin override allowing deletion of signed or validated CRAs.
- No changes to the PDF generation, signing, or validation workflows.

## Acceptance criteria

- `DELETE /api/cras/{id}` returns 204 for a CRA with status `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, or `SIGNED_BY_PROVIDER`.
- `DELETE /api/cras/{id}` returns 409 for a CRA with status `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, or `VALIDATED`.
- After successful deletion, `GET /api/cras/{id}` returns 404.
- After deletion, no `cra_day_entry`, `cra_signature_token`, `cra_download_token`, `cra_client_signature_record`, or `cra_transition_event` rows exist for that CRA ID.
- Provider, client, and project records are unaffected.
- History page: delete button is visible for eligible CRAs only; a confirmation dialog appears before deletion; after confirmation the CRA row disappears and the list refreshes.
- CRA detail modal: delete button visible for eligible CRAs only; same confirmation/close/refresh behavior.
- CRAs with status `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, or `VALIDATED` show no delete button in any view.
