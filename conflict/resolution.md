# T051 Conflict Resolution

Conflicts arose merging T051 (provider signature capture and reusable signature settings) with main, which already included T052 (CRA signature workflow + status machine) and T058 (rectangular signature box in PDF).

## Summary of intent preserved

- **T051**: `ProviderSignatureSettings` CRUD entity/service, `providerSignatureImage`/`providerSignerName` stored on `MonthlyCraReport`, `CraValidation` component (validate button + confirmation dialog), `SignatureSettings` component, `ValidateCraRequestDto` (3-field: date + image + signer name).
- **HEAD (T052/T058)**: Full CRA status enum (`DRAFT → READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE → FULLY_SIGNED → VALIDATED`), `clientAddress`/`clientContactRole` on DTO, `ProviderSignatureBox`, `ClientSettingsForm`/`ProviderSettingsForm`, `SignProviderRequestDto` (1-field: date only), `invalid_cra_transition`/`duplicate_cra_transition` error codes.

---

## Files resolved

### 1. `backend/.../CraDetailsDto.java` — UU

**Conflict:** HEAD added `clientAddress, clientContactRole` (positions 15-16); T051 added `providerSignatureImage, providerSignerName` (positions 15-16).

**Decision:** Keep all 4 fields. Order: `clientAddress, clientContactRole` (HEAD, positions 15-16) then `providerSignatureImage, providerSignerName` (T051, positions 17-18). Total: 18 fields.

---

### 2. `backend/.../CraDetailsMapper.java` — UU

**Conflict:** Last 2 constructor args: HEAD passed `getClientAddress(), getClientContactRole()`; T051 passed `getProviderSignatureImage(), getProviderSignerName()`.

**Decision:** Pass all 4 in field-order: `clientAddress, clientContactRole, providerSignatureImage, providerSignerName`.

---

### 3. `backend/.../CraDayUpdateService.java` — UU

Same trailing-args conflict as `CraDetailsMapper.java`. Same resolution: all 4 args.

---

### 4. `backend/.../SignProviderRequestDto.java` — UU (rename conflict)

**Conflict:** Git merged HEAD's `SignProviderRequestDto.java` (1 field: `providerSignatureDate`) with T051's `ValidateCraRequestDto.java` (3 fields: date + image + signer) into one file with conflict markers and a dual path annotation.

**Decision:**
- Kept `SignProviderRequestDto.java` as HEAD's 1-field version (used by `CraSignatureController`).
- Created `ValidateCraRequestDto.java` as a new file with T051's 3-field content (used by `CraValidationController`).
- Removed unused `@NotBlank` import from `SignProviderRequestDto.java`.

---

### 5. `backend/.../CraValidationController.java` — DU (T051 new, HEAD deleted)

Already contained T051's clean content (no conflict markers). Staged as-is.

---

### 6. `backend/.../CraValidationService.java` — DU (T051 new, HEAD deleted)

Already contained T051's clean content. Staged as-is.

---

### 7. `backend/.../CraControllerTest.java` — UU

**Conflict:** HEAD passed 10 named args after `days` (valid 16-arg constructor); T051 passed 10 nulls. Merged DTO now has 18 fields → 12 trailing args needed.

**Decision:** Keep HEAD's 10 meaningful values, append 2 nulls for `providerSignatureImage` and `providerSignerName`.

---

### 8. `backend/.../CraDtoTest.java` — UU

**Conflict:** Both sides had identical content, only whitespace differed. Merged DTO has 18 fields; test was passing 16 args.

**Decision:** Remove conflict markers, add 2 more trailing nulls (for `clientAddress, clientContactRole`) and 2 more (for `providerSignatureImage, providerSignerName`) = 4 total trailing nulls.

---

### 9. `backend/.../CraValidationControllerTest.java` — DU (T051 new)

Already contained T051's clean content. `VALIDATED_DTO` used 16 args; now 18 fields exist.

**Fix:** Inserted `null, null` (clientAddress, clientContactRole) at positions 15-16, before the existing `"data:image/png;base64,abc", "Jean Dupont"` (providerSignatureImage, providerSignerName).

---

### 10. `backend/.../CraWorkflowIntegrationTest.java` — DU (T051 new)

Already contained T051's clean content. Staged as-is.

---

### 11. `backend/.../CraValidationServiceTest.java` — DU (T051 new)

Already contained T051's clean content. Uses Mockito mocks — does not construct `CraDetailsDto` directly. Staged as-is.

---

### 12. `backend/.../CraDayControllerTest.java` — not in conflict list

`DRAFT_DTO` used 16 args; merged DTO has 18 fields.

**Fix:** Added 2 trailing nulls for `providerSignatureImage` and `providerSignerName`.

---

### 13. `frontend/src/api/apiError.ts` — UU

**Conflict:** HEAD had `invalid_cra_transition`, `duplicate_cra_transition`; T051 had `signature_too_large`, `signature_invalid_format`.

**Decision:** Include all 4 codes.

---

### 14. `frontend/src/api/errorMessages.ts` — UU

Same 4-code merge. All 4 messages retained.

---

### 15. `frontend/src/api/httpClient.ts` — UU

**Conflict 1:** Same 4 error codes in `toApiErrorCode()` — all 4 retained.

**Conflict 2:** Duplicate `apiPut` function (one from each branch). Removed the second duplicate.

---

### 16. `frontend/src/api/types.ts` — UU

**Conflict:** HEAD had `providerFirstName/LastName/Company, clientFirstName/LastName/Company`; T051 had `providerSignatureImage, providerSignerName`.

**Decision:** Keep all fields from both sides, adding also `clientAddress` and `clientContactRole` to match the backend DTO.

---

### 17. `frontend/src/components/AppShell/AppShell.tsx` — UU

**Conflict 1 (type block):** HEAD exported `AppView` type (required by App.tsx import); T051 used local `View` type.

**Decision:** Keep `export type AppView` (HEAD). Use T051's French label "Paramètres".

**Conflict 2 (button label):** HEAD "Settings" vs T051 "Paramètres".

**Decision:** Use "Paramètres".

---

### 18. `frontend/src/types/cra.ts` — UU (complex)

**Conflict:** HEAD had full 6-value status enum + `providerSignatureDate` + provider/client name fields + `providerSignatureImageUrl`; T051 simplified to `DRAFT|VALIDATED` + added `providerSignatureImage`/`providerSignerName` + spurious `CraDetailsDto` interface re-export.

**Decision:**
- Keep HEAD's full 6-value status enum (needed by T052 workflow).
- Keep `providerSignatureDate`.
- Keep all provider/client name fields (from HEAD).
- Replace `providerSignatureImageUrl` with `providerSignatureImage` (T051 naming, consistent with backend).
- Add `providerSignerName` (T051).
- Remove spurious `CraDetailsDto` interface (already defined in `api/types.ts`).

---

### 19. `frontend/src/App.tsx` — UU (4 conflict blocks)

**Block 1 (imports):** HEAD imports `ClientSettingsForm`, `ProviderSettingsForm`, `ProviderSignatureBox`; T051 imports `CraValidation`, `SignatureSettings`.

**Decision:** Keep all 5 imports — both sets are needed.

**Block 2 (dtoToDetails):** HEAD maps name fields; T051 maps `providerSignatureImage`/`providerSignerName`.

**Decision:** Map all fields from both sides.

**Block 3 (settings view):** HEAD shows `ProviderSettingsForm + ClientSettingsForm`; T051 shows `SignatureSettings`.

**Decision:** Show all 3: `ProviderSettingsForm`, `SignatureSettings`, then `ClientSettingsForm` with settings error.

**Block 4 (CalendarGrid area):** HEAD has `onDayClick` guard `=== 'DRAFT'` + `ProviderSignatureBox`; T051 has `!== 'VALIDATED'` guard + `CraValidation`.

**Decision:** Use `=== 'DRAFT'` guard (correct: only DRAFT is editable). Keep both `ProviderSignatureBox` and `CraValidation`. Fix T051's undefined reference `handleCraValidated` → `handleSignatureSuccess` (already defined).

---

### 20. `frontend/src/components/CraValidation/` — DU × 4 (T051 new files)

`CraValidation.tsx`, `CraValidation.css`, `CraValidation.test.tsx`, `CraValidation.axe.test.tsx` — all clean T051 content. Staged as-is.
