Plan written to `runs/T023/plan.md`. Here's a summary of what it covers:

**New component**: `ConfirmDialog` (native `<dialog>`, no library) with confirm/cancel buttons.

**Modified components**:
- `CraSummaryPanel` — adds a "Valider le CRA" button (DRAFT only), a locked badge (VALIDATED), and a `validationError` alert prop
- `CalendarGrid` — adds an `isLocked` prop that applies a `calendar-grid--locked` CSS class
- `App` — wires the confirm flow: open dialog → call `validateCra(id, { providerSignatureDate: today })` → update state or show mapped error

**Explicitly excluded**: day editing UI (CalendarGrid stays display-only for now), PDF button, client signature, reopen workflow, and validation date picker (auto-set to today).
