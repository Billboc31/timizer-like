Implementation is complete. Here's a summary:

---

## Files created/modified

**New:**
- `frontend/src/components/NewCraDialog/NewCraDialog.tsx` — Native `<dialog>` component with two date inputs, inline validation (both required, end ≥ start), focus trap, ESC/cancel handling, loading/error props, and `showModal()`/`close()` driven by the `open` prop.
- `frontend/src/components/NewCraDialog/NewCraDialog.css` — Minimal styles matching the `CraValidation` dialog pattern.

**Modified:**
- `frontend/src/components/AppShell/AppShell.tsx` — Added `onNewCra: () => void` and `newCraTriggerRef?: RefObject<HTMLButtonElement | null>` props; "New CRA" nav button now calls `onNewCra` and holds the trigger ref for focus return.
- `frontend/src/App.tsx` — Added `newCraDialogOpen`, `newCraLoading`, `newCraError`, `selectedPeriod` state and `newCraTriggerRef`; `handleNewCraConfirm` calls `listCras()` to detect an existing CRA for the start month (opens it if found, creates via `createCra` otherwise); focus returns to the nav button on dialog close via a `useEffect`.

## Acceptance criteria verified

- "New CRA" in the nav is present on every authenticated view — it opens the dialog instead of navigating.
- Invalid ranges (empty date or end < start) are rejected with an inline error; the dialog stays open.
- Confirming a valid range reuses an existing CRA or creates a new one, then opens the calendar on the start month.
- Cancelling (button or ESC) leaves the current view and data unchanged.
- No pre-existing TypeScript errors were introduced.
