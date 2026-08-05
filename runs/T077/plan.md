## Objective

After a client successfully signs a CRA, transition its status directly to the terminal `VALIDATED` state and enforce immutability end-to-end: no further mutation is permitted via API or UI.

## Included

### Backend

**`ClientSignatureService.sign()`**
- Replace `cra.setStatus(ValidationStatus.FULLY_SIGNED)` with `cra.setStatus(ValidationStatus.VALIDATED)`.
- The audit event already records the transition as `→ VALIDATED`; removing the `FULLY_SIGNED` intermediate aligns persistence with intent.
- Remove or retire `FULLY_SIGNED` from `ValidationStatus` if no other path produces it; otherwise leave the enum value but stop emitting it from this path.

**`CraDetailsMapper` (public API mapping)**
- Remove the `FULLY_SIGNED → AWAITING_CLIENT_SIGNATURE` mapping entry; after the fix above it is dead code.
- Confirm `VALIDATED → CraStatus.VALIDATED` mapping is present and correct.

**`CraReopenService.reopen()`**
- Add guard at entry: if `cra.getStatus()` is `VALIDATED` (or `FULLY_SIGNED` as a safety net), throw `CraValidatedException`. Reopen must be impossible once the client has signed.

**Mutation endpoint audit — add `VALIDATED` guards where missing**
For each endpoint that mutates a CRA, verify the guard rejects `VALIDATED` status (409 CONFLICT via existing `CraValidatedException` pattern):
- Period / month-year update endpoint (if it exists).
- Metadata / representative-name update endpoint (if it exists).
- Regenerate / PDF-rebuild endpoint that alters business data.
- Delete endpoint.
- `CraDayUpdateService` already guards `!= DRAFT`; confirm it covers `VALIDATED`.

**Idempotency verification — `CraSignatureTokenService.validateAndConsume()`**
- Confirm that a second signature submission on the same token returns `TokenAlreadyConsumedException` before any CRA mutation is attempted (the consumed-at check at line 107–108 fires before the status check).
- Confirm the HTTP response is 409 or 400 (not 500) for a replay.

**`CraApiExceptionHandler`**
- No new exception type expected; reuse existing 409 mappings.
- If a new `CraAlreadyClientSignedException` is introduced for `reopen()`, register its handler here.

### Frontend

**`CraSignatureStatus` component**
- Verify `VALIDATED` maps to a visually locked badge (distinct colour/icon from `AWAITING_CLIENT_SIGNATURE`).
- Add or confirm a CSS modifier class (e.g. `--signed`) that signals finality to the user.

**`CraDetailModal` / `CraSummaryPanel`**
- When `status === 'VALIDATED'`, hide or disable all edit controls (day-cell pencils, period selector, metadata fields).
- Display an explanatory banner: "Cette CRA a été définitivement validée par le client."
- Hide the "Rouvrir" (reopen) button entirely for `VALIDATED` CRAs.

**`CraSignatureActions`**
- Already renders a read-only view for `VALIDATED` (provider + client signer name and date).
- Confirm no "generate link" or "send to client" button is rendered for `VALIDATED`.

**`CraHistory` list**
- Confirm `statusLabel('VALIDATED')` and `statusBadgeModifier('VALIDATED')` return correct values.
- Confirm edit and delete controls (if rendered per-row) are hidden for `VALIDATED` rows.

**Calendar / `CraPeriodNavigator`**
- Confirm day cells do not render edit affordances when the CRA is `VALIDATED`.
- Backend already blocks writes; the UI guard prevents misleading interactions.

## Excluded

- Introducing a new public API status value (e.g. `SIGNED`); `VALIDATED` is the existing terminal status.
- Any change to the provider-signature flow.
- Migrating existing `FULLY_SIGNED` rows in the database (if any exist in production); a separate data-fix ticket is needed if rows were persisted with `FULLY_SIGNED`.
- Role-based admin override to un-sign a validated CRA.
- PDF regeneration that is purely cosmetic (no business-data change).
- Changes to `CraClientSignatureRecord` or `CraTransitionEvent` schema (already correct).

## Acceptance criteria

- After a successful client signature, `GET /api/cras/{id}` returns `"status": "VALIDATED"`.
- The History view immediately shows the `VALIDATED` badge on the next load.
- `PATCH /api/cras/{id}/days/{date}` on a `VALIDATED` CRA returns 409.
- `POST /api/cras/{id}/reopen` on a `VALIDATED` CRA returns 409.
- Any other mutation endpoint (period, metadata, delete, regenerate) on a `VALIDATED` CRA returns 409.
- Submitting the client signature form a second time (replay) returns 409 and does not alter the CRA or create a duplicate signature record.
- Unsigned (`DRAFT`, `AWAITING_CLIENT_SIGNATURE`) CRAs continue through the existing workflow unaffected.
- The CRA detail modal shows the locked banner and no edit controls when `status === 'VALIDATED'`.
- The "Rouvrir" button is absent from the detail modal for `VALIDATED` CRAs.
