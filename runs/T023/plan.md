The plan has been written to `runs/T023/plan.md`. It covers:

- **`App.tsx`** — switch from `console.log` to rendering a new `CraPage` component when a CRA is opened
- **`CraPage/`** (new component) — loads full CRA via `getCra`, shows a validate button for DRAFT CRAs, inline confirmation panel, calls `validateCra` with today's date as `providerSignatureDate`, shows a validated badge on success, and inline error on failure
- **`CalendarGrid`** — add a `locked` prop that applies a CSS class dimming the grid with `pointer-events: none`
- **8 test cases** for `CraPage` covering all acceptance-criteria branches

Key assumption made explicit in the plan: `providerSignatureDate` is auto-filled with today's date (no date picker shown, not mentioned in the ticket).
