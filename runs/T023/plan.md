The plan has been written to `runs/T023/plan.md`. It covers:

- A new `CraDetail` component with an inline confirmation flow (no modal library needed).
- `CalendarGrid` gains a `locked` prop with a `calendar-grid--locked` CSS class.
- `App.tsx` wired to render `CraDetail` when a CRA is opened.
- `validateCra` called with `providerSignatureDate: null` (client signature is explicitly out of scope).
- Tests for every acceptance-criteria branch.
