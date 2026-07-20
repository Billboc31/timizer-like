The plan is written to `runs/T023/plan.md`. It covers:

- **New `ConfirmDialog` component** — vanilla React modal (no library), with tests
- **New `CraPage` component** — wraps CalendarGrid with a validate button, confirmation flow, status banner, and error display, with tests
- **`App.tsx` change** — wire `currentCra` state so selecting a CRA renders `CraPage` instead of logging

Key assumptions flagged: `providerSignatureDate` sent automatically as today's date (client signature is out of scope per ticket). No changes to `CalendarGrid` since locked-state logic already exists.
