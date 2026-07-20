The plan is written to `runs/T023/plan.md`. It covers:

- **ConfirmDialog** — minimal native React modal, no library, with 4 tests
- **CraPage** — validation button, confirm flow, status banner, read-only CalendarGrid, error display, with tests covering each behaviour
- **App.tsx** — wire `currentCra` state to render `CraPage`
- **API layer** — reproduced from T028 baseline without modification

Key assumptions made explicit: the frontend doesn't exist yet in this worktree (T028 is the canonical reference), `providerSignatureDate` is today's date sent automatically, and CalendarGrid needs a `readOnly` prop gate.
