The plan has been written to `runs/T025/plan.md`. It covers:

- A new `CraHistoryRow` type (extends `CraSummaryDto` with `validationDate`)
- A `listCras()` API function for `GET /api/cras`
- The `HistoryPage` component with loading / error / empty / data states, a table with all required columns, and callback-based navigation (no router — consistent with existing patterns)
- BEM CSS and Vitest tests covering all states and interactions
- `App.tsx` wiring via callbacks
- Explicit exclusions matching the ticket's out-of-scope list
