# Review — T066: Redesign the client CRA signature page

## Overall assessment

The implementation is thorough and covers almost all requirements correctly. The redesigned page layout, CRA summary card, signature canvas, error states, and success screen are all well-executed. One blocking security issue exists in the new PDF download endpoint. Three minor quality issues are noted.

---

## Scope compliance

The implementation stays within the defined boundaries. Internal signing workflow, provider signature flow, PDF generation engine, token security mechanisms, and the main authenticated UI are untouched. The plan's three backend additions (DTO fields, new exception, new controller) and twelve frontend changes are all present and accounted for.

---

## Blocking issues

### [BLOCKING] Unauthenticated enumerable PDF download endpoint

**File:** `backend/src/main/java/com/timizerlike/backend/cra/web/PublicCraPdfController.java`

`GET /public/cra/{craId}/pdf` returns the CRA PDF for any CRA in `FULLY_SIGNED` or `VALIDATED` status without any authorization check. The `craId` path parameter is a JPA-managed `Long`, which in practice is a sequential auto-increment integer.

Consequence: any external party who knows the URL pattern can enumerate all finalized CRAs and download their PDFs. CRA PDFs contain personal names, billing periods, days worked, and signature images — data that must be restricted to the involved parties.

The existing public endpoints (`/public/cra-link/{token}`, `/public/cra-link/{token}/sign`) are protected by a 256-bit random token. Only the new PDF endpoint is exposed by a sequential numeric ID, creating an asymmetry.

The plan explicitly describes "no authentication required for these two statuses only" — but this design decision introduces a significant information disclosure risk that was not required by the ticket.

**Required fix:** Extend the signing response to include a short-lived PDF download token. For example:
- Have `POST /public/cra-link/{token}/sign` return `{ "pdfToken": "<random-token>" }`.
- `GET /public/cra/{craId}/pdf?token=<pdfToken>` validates the token against the CRA before returning the PDF.

This keeps the endpoint publicly accessible to the signer without exposing all finalized CRAs by enumeration. The `SigningSuccessScreen` stores the `pdfToken` in state (alongside `craId`) and passes it to the download call. The backend verifies the token matches the `craId` and has not expired (e.g. 7 days TTL).

---

## Non-blocking issues

### [MINOR] TypeScript type error: unforwarded props on `SignatureCanvas`

**Files:** `ClientSignatureForm.tsx:124-130`, `SignatureCanvas.tsx:10-16`

`ClientSignatureForm` passes `data-testid="signature-canvas"` and `aria-labelledby="signature-pad-label"` to `<SignatureCanvas>`, but the `Props` interface does not include these keys, and the `forwardRef` body does not spread unknown props onto the `<canvas>` element. Both attributes are silently dropped.

Practical impact:
- `data-testid` is never applied to the DOM canvas element. Tests are unaffected because they locate the canvas via `screen.getByRole('img')`, not by testid.
- `aria-labelledby` is never applied. Accessibility is partially preserved because the canvas already declares `aria-label="Zone de dessin de la signature"` — but the label association via ID does not function.
- `tsc --noEmit` will report a type error on these two props.

**Fix:** Extend `Props` to accept `'data-testid'?: string` and `'aria-labelledby'?: string`, and forward them as explicit props to the `<canvas>` element. The canvas can then drop its hardcoded `aria-label` in favour of the referenced label, which is more semantically correct.

---

### [MINOR] `isEmpty()` false positive on single tap without stroke

**File:** `SignatureCanvas.tsx:75-83`

`handlePointerUp` sets `hasDrawn.current = true` whenever `isDrawing.current` was true — even if the pointer never moved between down and up. A user who accidentally taps the canvas without drawing any stroke will have `isEmpty()` return `false`, and `padNonEmpty` will be set to `true` in the parent form. The `handleSubmit` guard `canvasRef.current?.isEmpty()` does not catch this because `hasDrawn` is already true.

Result: the submit button becomes enabled with a visually empty signature.

**Fix:** Gate the assignment of `hasDrawn.current = true` on at least one `handlePointerMove` event having executed during the current stroke, or implement `isEmpty()` via `getImageData` inspection of non-transparent pixels.

---

### [MINOR] `URL.revokeObjectURL` called before download is guaranteed to start

**File:** `SigningSuccessScreen.tsx:30-32`

```typescript
a.click();
URL.revokeObjectURL(url);  // synchronous, immediately after click
```

The object URL is revoked synchronously in the same task as the click. Modern desktop browsers tolerate this because they queue the download request before the current task completes. However, this is not specified behaviour and may fail in embedded WebViews or future browser versions.

**Fix:** Revoke the URL in a `setTimeout(() => URL.revokeObjectURL(url), 100)` or after appending the anchor to the document and listening to the `click` event.

---

## Ticket requirements verification

| Requirement | Status | Notes |
|---|---|---|
| CRA identity, period, consultant, client, totals visible | ✓ | |
| Localized date format (not ISO) | ✓ | `formatLocalDate` uses `fr-FR` locale |
| Status badge | ✓ | Three statuses handled |
| Remove technical/internal info from client view | ✓ | No internal IDs or raw enums shown |
| Worked-days table with filtered/formatted entries | ✓ | Filters `worked === 0`, formats 1/0.5 |
| Three distinct error states (invalid, already-consumed, wrong-status) | ✓ | `resolveErrorMessage` + three tests |
| Loading spinner | ✓ | |
| Large, clearly bordered signature pad | ✓ | |
| Pointer Events (mouse, touch, stylus) | ✓ | `onPointerDown/Move/Up` |
| `touch-action: none` prevents page scroll during signing | ✓ | Applied via CSS on `.signature-canvas` |
| Coordinate scaling after CSS resize | ✓ | `getPos()` scales with `canvas.width / rect.width` |
| "Effacer" button resets pad | ✓ | `data-testid="clear-button"` preserved |
| "Signer et valider le CRA" button | ✓ | |
| Submit disabled until name + consent + pad | ✓ | `canSubmit` condition |
| Double submission prevention | ✓ | `submitting` flag disables button and canvas |
| Error banner without erasing signature | ✓ | Error shown; `setSubmitting(false)` only; no clear |
| Success screen with date and PDF download | ✓ | `SigningSuccessScreen` with `signedAt` date |
| PDF download after signing | ✗ BLOCKING | Endpoint is unauthenticated and enumerable by ID |
| Expired / already-signed link states | ✓ | Three distinct frontend messages |
| Responsive, no horizontal scroll on mobile | ✓ | `@media (max-width: 640px)` block present |
| Accessible labels and keyboard navigation | ✓ (partial) | `aria-label` on canvas; `htmlFor` on inputs; `aria-labelledby` forwarding issue (minor) |
| `data-testid` stability | ✓ | All original testids preserved |
| Tests updated and passing | ✓ | 291 tests pass; 3 new error-code tests; date assertion updated |
| `GET /public/cra/{craId}/pdf` endpoint | ✗ BLOCKING | Security: see blocking issue above |

---

## Security checklist

| Check | Result |
|---|---|
| No secrets in code or logs | ✓ |
| Token hashing (SHA-256) unchanged | ✓ |
| `token_already_consumed` / `isConsumed()` flow intact | ✓ |
| New PDF endpoint: status gating | ✓ but unauthenticated — BLOCKING |
| New PDF endpoint: `CraNotFoundException` → 404 on unknown ID | ✓ (handled by existing exception handler) |
| `resolveToken` now returns 409 instead of 404 for wrong-status CRAs | Note: reveals token-to-CRA mapping to probers — intentional per plan, minor trade-off |

---

## Conclusion

The implementation delivers a well-structured, accessible, and visually professional redesign that satisfies the vast majority of ticket requirements. The single blocking item — the publicly enumerable PDF download endpoint — must be redesigned before approval. The three minor issues (TypeScript prop forwarding, isEmpty false positive, revokeObjectURL timing) are low risk but should be corrected in the same pass.

IMPLEMENTATION_FIX_REQUIRED
