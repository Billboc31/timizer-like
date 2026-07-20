The plan has been written to `runs/T023/plan.md`. It covers:

- **New `CraPage` component** — fetches CRA details, shows validate button for DRAFT, inline confirmation step, calls `validateCra` with today's date as `providerSignatureDate`, shows locked badge after success, displays errors with `role="alert"`.
- **`CalendarGrid` changes** — new `isLocked` prop + CSS class.
- **`App.tsx`** — wires the stub `onOpen` callback to render `CraPage`.
- **Tests** — `CraPage.test.tsx` covering all state transitions; `CalendarGrid.test.tsx` extended for the locked prop.
- One explicit hypothesis: `providerSignatureDate` is auto-set to today since the signature UI is out of scope.
