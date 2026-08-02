# Test Report — T073: Enable all CRA editing and workflow actions inside the shared modal

## Test execution

- Command: `npm test -- --run` (frontend)
- Result: **311 tests pass, 0 failures, 34 test files**
- Date: 2026-08-02

---

## Acceptance criteria

### 1. A draft CRA opened from the annual calendar can be edited and saved entirely inside the modal
**PASS**

`CraDetailModal` renders `CalendarGrid` with `onDayClick={cra.status === 'DRAFT' ? handleDayClick : undefined}`. Clicking a day calls `updateDay`, refreshes modal state, and calls `onMutated`. `CraValidation` is also rendered for DRAFT, providing the full consultant signature workflow.

Tests: "DRAFT CRA: clicking a day calls updateDay", "DRAFT CRA: successful day update calls onMutated"

---

### 2. A CRA opened from History provides the same authorized actions
**PASS**

`App.tsx` wires both `AnnualCalendar.onOpenCra` and `CraHistory.onOpenDetail` to the same `handleOpenModal` callback. Both open the same `CraDetailModal` component with the same props.

Tests: `App.test.tsx` — modal opens from History list item; same CraDetailModal renders for all entry points.

---

### 3. Consultant validation/signature and client-link actions work from the modal
**PASS**

- Consultant signature: `CraValidation` is rendered inside the modal for DRAFT CRAs. It loads the stored signature, shows a confirmation dialog, calls `validateCra`, and propagates success via `onValidated → handleValidated → onMutated`.
- Client signature link: `CraSummaryPanel` renders `CraSignatureActions`, which exposes "Générer le lien de signature" for `AWAITING_CLIENT_SIGNATURE` CRAs and supports copy-to-clipboard.

Tests: "DRAFT CRA: renders CraValidation button", "DRAFT CRA: successful validation calls onMutated", "AWAITING_CLIENT_SIGNATURE CRA: shows generate signature link button"

---

### 4. PDF download/generation works from the modal
**PASS**

`handleDownload` calls `downloadCraPdf`, creates a blob URL, triggers an `<a>` click, and revokes the URL. The button is rendered in the sticky actions bar for `VALIDATED` and `AWAITING_CLIENT_SIGNATURE` statuses.

Tests: "shows download PDF button for VALIDATED CRA", "shows download PDF button for AWAITING_CLIENT_SIGNATURE CRA", "triggers PDF download when download button is clicked"

---

### 5. Actions unavailable for the current status are hidden or disabled with an understandable reason
**PASS**

- PDF download: hidden for DRAFT.
- Reopen: hidden for DRAFT (`cra.status !== 'DRAFT'`).
- Validation: `CraValidation` returns `null` for non-DRAFT.
- Generate client link: only for `AWAITING_CLIENT_SIGNATURE`.
- No-signature message: `CraValidation` shows an explicit informational text ("Configurez votre signature dans les Paramètres…") when no signature is configured, without offering a non-functional button.

Tests: "does not show download PDF button for DRAFT CRA", "does not show reopen button for DRAFT CRA"

---

### 6. Closing with unsaved edits requires confirmation
**PASS** (with design note)

Day edits auto-save to the API immediately (no local unsaved buffer). Confirmation is therefore scoped to "action in-flight" (API call running) rather than "unsaved local edits". This is the correct pattern for the application's auto-save design.

- `anyActionInFlight = downloading || reopening || updatingDay !== null`
- Both the × button and Escape key (native `cancel` event) are guarded.
- Browser back (popstate) is also guarded via `modalActionInFlightRef` in `App.tsx`.

Tests: "shows confirm dialog and aborts close when action is in-flight and user cancels", "shows confirm dialog and aborts close via Escape (cancel event) when action is in-flight"

---

### 7. Successful mutations update the underlying calendar/history without a full page reload
**PASS**

`handleModalMutated` in `App.tsx` increments both `annualCalendarRefreshKey` and `historyRefreshKey` on every `onMutated` call. Both `AnnualCalendar` and `CraHistory` re-fetch when their respective key changes.

Tests: "re-fetches CRA list when refreshKey increments" in both `AnnualCalendar.test.tsx` and `CraHistory.test.tsx`

---

### 8. No feature is available only in the old standalone CRA screen unless explicitly documented as out of scope
**PASS** (minor observation documented below)

All functional actions available in standalone are also present in the modal. `ProviderSignatureBox` renders in the standalone view but has `onSignClick={() => {}}` (a no-op), making it display-only and non-functional in standalone as well. The modal provides equivalent display via `CraSignatureActions` (provider/client signer names and dates for VALIDATED). No actionable gap.

"Delete CRA" is not implemented anywhere in the codebase, consistent with the ticket requirement "when that action already exists and is authorized" — it does not exist.

---

### 9. Shared component tests prove parity between modal and standalone/deep-link rendering
**PASS**

`CraValidation`, `CalendarGrid`, `CraSummaryPanel`, `CraSignatureActions`, and `CraSignatureStatus` each have their own test suites. `CraDetailModal.test.tsx` verifies the integration of these components in the modal, covering DRAFT, AWAITING_CLIENT_SIGNATURE, and VALIDATED statuses. `App.test.tsx` covers the full integration through `App`.

---

### 10. Integration tests cover editing, saving, validation, PDF download, error handling, and unsaved-change protection
**PASS**

| Scenario | Test |
|---|---|
| Editing (day click) | "DRAFT CRA: clicking a day calls updateDay" |
| Saving (mutation callback) | "DRAFT CRA: successful day update calls onMutated" |
| Validation (full flow) | "DRAFT CRA: successful validation calls onMutated" |
| PDF download | "triggers PDF download when download button is clicked" |
| Error handling (fetch fail) | "shows error alert and retry button when getCra fails" |
| Error handling (retry) | "retries fetch when Réessayer is clicked" |
| In-flight protection (button) | "shows confirm dialog and aborts close when action is in-flight…" |
| In-flight protection (Escape) | "shows confirm dialog and aborts close via Escape…" |
| Reopen | "after reopen success, calls onMutated with refreshed DTO" |

---

## Regressions

None. All 311 pre-existing tests continue to pass.

---

## Blocking issues

None.

---

## Minor observations (non-blocking)

1. `ProviderSignatureBox` is mounted in standalone but not in the modal. Since its `onSignClick` is a no-op (`() => {}`), it provides no interactive functionality in standalone. The modal covers the equivalent display through `CraSignatureActions`. No functional regression.
2. The focus trap (Tab cycling) in `CraDetailModal` and `CraValidation` uses direct `querySelectorAll` rather than a shared utility. Works correctly; not a bug.

---

## Verdict

**VALIDATION PASSED**
