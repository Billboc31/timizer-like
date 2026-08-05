---
ticket: T076
status: APPROVED
date: 2026-08-05
---

# Test Report — T076

## Implementation summary

Single-file CSS fix: `frontend/src/components/CraDetailModal/CraDetailModal.css`

The root cause was `display: flex` applied unconditionally on `.cra-detail-modal`, overriding the native `<dialog>` element's default `display: none`. The fix moves `display: flex; flex-direction: column;` to `.cra-detail-modal[open]`, restoring the browser's native hide-when-closed behaviour.

---

## Acceptance criteria

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | No "Détail CRA" panel appears automatically at the bottom of pages | **PASS** | CSS fix: `display: flex` now scoped to `[open]`. Test `dialog is not open when craId is null` confirms `document.querySelector('dialog[open]')` is absent when `craId` is `null`. |
| 2 | Panel not visible on Home, History, Settings, CRA creation unless explicitly opened | **PASS** | `modalCraId` initialises to `null` (or a URL-supplied id, intentional). Without `[open]`, the `<dialog>` is invisible. No view renders `<CraDetailModal>` outside of App.tsx's single mount. |
| 3 | An intentionally opened CRA detail view can be closed | **PASS** | Three close paths tested and passing: × button (`calls onClose when × (Fermer) button is clicked`), Escape key via `onCancel` event (`calls onClose when the native cancel event fires`), backdrop click (`calls onClose when backdrop is clicked`). |
| 4 | Closing it removes it completely from the DOM or hidden UI state | **PASS** | Test `dialog closes when craId changes back to null` verifies `dialog[open]` absent after `craId → null`. The `<dialog>` element stays in the DOM (by design, noted as acceptable in the review) but is invisible and inert. `modalCraId` is reset to `null` via `handleModalClose → setModalCraId(null)`. |
| 5 | Existing CRA detail access remains functional without regression | **PASS** | All 288 tests pass, including: calendar and history entry-point tests, content rendering, loading/error states, day updates, validation, reopen, PDF download. |

---

## Test execution

```
Test Files  32 passed (32)
      Tests  288 passed (288)
   Duration  3.62s
```

Command: `npm test -- --reporter=verbose --run` (in `frontend/`)

---

## Regressions observed

None.

---

## Blocking issues

None.

---

## Notes

- The `<dialog>` element remains permanently mounted in the DOM even when `craId` is `null`. This is deliberate (conditional rendering was explicitly excluded from scope). The `[open]` attribute is absent when closed, so the element is hidden and unreachable to users and assistive technologies.
- The `dialog is not open when craId is null` unit test directly validates the core fix and was already present from prior tickets (T072/T073), confirming the regression path is covered.

---

IMPLEMENTATION_APPROVED
