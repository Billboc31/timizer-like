## Objective

Add the client signature capture and approval form to the existing public CRA review page (built in T053), and the backend endpoint that validates the request, persists the signature snapshot, consumes the one-time token, and transitions the CRA status to `VALIDATED`.

## Included

**Prerequisite hypothesis:** T053 (`CraSignatureToken` entity, `CraSignatureTokenService`, `PublicCraViewController` at `GET /api/public/cra/{token}`, and the frontend public review route at `/sign/{token}`) is merged into this branch before implementation begins. If not present, those T053 artefacts must be carried over first.

---

**Backend — new classes**

1. `CraClientSignatureRecord` entity (`com.timizer.backend.cra` package)  
   Fields: `id`, `craId`, `tokenId`, `signerName` (not blank), `signerRole` (nullable), `consentApproved` (boolean), `signatureImageBase64` (TEXT/CLOB), `craContentSnapshot` (TEXT, JSON), `signedAt` (Instant)  
   Flyway migration: `V{n}__add_cra_client_signature_record.sql`

2. `CraClientSignatureRecordRepository` — JPA repository

3. `ClientSignatureRequestDto` — request body:  
   - `signerName` (String, `@NotBlank`)  
   - `signerRole` (String, nullable)  
   - `consentApproved` (boolean, must be `true`)  
   - `signatureImageBase64` (String, `@NotBlank`, must start with `data:image/`)

4. `ClientSignatureService` — orchestration:  
   - Calls `CraSignatureTokenService.validateAndConsume(token)` — throws if already consumed or not found  
   - Asserts CRA status is `SIGNED_BY_PROVIDER`; throws `CraNotSignedByProviderException` otherwise  
   - Asserts `consentApproved == true`; throws `ConsentNotGivenException` otherwise  
   - Asserts `signatureImageBase64` is non-blank and prefixed with `data:image/`  
   - Serialises current CRA day entries + metadata to JSON for `craContentSnapshot`  
   - Persists `CraClientSignatureRecord`  
   - Transitions `MonthlyCraReport.status` to `VALIDATED`

5. `PublicCraSigningController` — `POST /api/public/cra/{token}/sign`  
   - Delegates to `ClientSignatureService`  
   - Returns `200 OK` on success  
   - Handled exceptions: consumed/unknown token → 410 Gone, wrong CRA status → 409 Conflict, consent not given / blank signature → 400 Bad Request

6. Extend the public exception handler (or `CraApiExceptionHandler`) to map the two new exceptions (`TokenAlreadyConsumedException`, `ConsentNotGivenException`) to the codes above

---

**Frontend — new code**

7. Add `signature_pad` npm dependency (canvas-based, touch + mouse, no heavy transitive deps)

8. `SignaturePad` component (`frontend/src/components/SignaturePad/SignaturePad.tsx`)  
   - `<canvas>` element; initialises `SignaturePad` instance from the library  
   - Exposes `isEmpty(): boolean` and `toDataURL(): string` via `useImperativeHandle` ref  
   - Accepts an `onDraw` callback to notify parent when the pad becomes non-empty

9. `ClientSignatureForm` component (`frontend/src/components/ClientSignatureForm/ClientSignatureForm.tsx`)  
   - Signer name text input (required, validated on submit)  
   - Signer role text input (optional)  
   - Consent checkbox: "Je confirme avoir examiné ce CRA et l'approuve" (required)  
   - `<SignaturePad>` canvas  
   - "Effacer la signature" button — clears the canvas  
   - Submit button — disabled until: name non-blank AND consent checked AND pad non-empty  
   - On submit: calls `submitClientSignature(token, body)`; shows inline error messages on failure  
   - On success: invokes `onSuccess` prop to hand off to `SigningSuccessScreen`

10. `SigningSuccessScreen` component (`frontend/src/components/SigningSuccessScreen/SigningSuccessScreen.tsx`)  
    - Static confirmation: signer name, date, and "Le CRA a bien été signé" message  
    - No redirect, no further action required

11. `frontend/src/api/publicCraClient.ts` — new file:  
    - `getPublicCra(token): Promise<CraPublicViewDto>`  
    - `submitClientSignature(token, body): Promise<void>`  
    Both call the `/api/public/cra/{token}` family of endpoints.

12. Update the public CRA review page/route (from T053):  
    - Mount `<ClientSignatureForm>` below the read-only CRA display  
    - On `onSuccess`, replace form with `<SigningSuccessScreen>`

---

**Tests**

13. `ClientSignatureServiceTest.java` (unit) — covers: happy path, token already consumed, CRA in wrong status, blank signer name, `consentApproved = false`, blank signature image

14. `PublicCraSigningControllerTest.java` (integration) — `POST /api/public/cra/{token}/sign`: 200 on valid payload, 410 on consumed token, 400 on missing name, 409 on CRA not in `SIGNED_BY_PROVIDER` status

15. `SignaturePad.test.tsx` (Vitest + Testing Library) — renders canvas, `isEmpty()` true initially, `onDraw` fired after pointer event, clear resets state

16. `ClientSignatureForm.test.tsx` (Vitest + Testing Library) — submit button disabled until all three conditions met; calls API with correct payload; shows `SigningSuccessScreen` on success; shows error message on API failure; accessibility (no axe violations)

17. `client-signing.spec.ts` (Playwright E2E) — full workflow: open public link with valid token → read-only CRA is displayed → fill name → check consent → draw signature (mouse drag) → click submit → `SigningSuccessScreen` is visible; second visit with same token → error state shown

## Excluded

- Legally qualified electronic signature (eIDAS, etc.)
- Editing or rejecting the CRA from the public page
- Threaded discussion or comment workflow
- Email notification to the provider after client signature
- PDF regeneration to embed the client signature image
- Any changes to the existing provider-side workflow (`CraValidationController`, `CraValidation` component)

## Acceptance criteria

- `POST /api/public/cra/{token}/sign` returns 200 with a valid, unconsumed token, non-blank signer name, `consentApproved: true`, and non-empty Base64 signature
- A second call with the same token returns 410 Gone
- Request with blank `signerName` returns 400
- Request with `consentApproved: false` returns 400
- Request with blank or absent `signatureImageBase64` returns 400
- After successful signing: `MonthlyCraReport.status = VALIDATED`, one `CraClientSignatureRecord` row exists with correct `signerName`, `signedAt`, `craContentSnapshot`, and non-blank `signatureImageBase64`
- Token is marked consumed and cannot be reused
- Frontend submit button remains disabled until signer name is filled, consent is checked, and the signature canvas is non-empty
- Signature pad accepts both mouse-drag and touch-pointer input (verified by Playwright touch emulation)
- "Effacer la signature" button clears the canvas and re-disables the submit button
- After successful submission the form is replaced by the success screen showing signer name and date
- All new backend tests pass (`./mvnw test`)
- All new frontend unit and E2E tests pass (`npm test`, `npm run test:e2e`)
