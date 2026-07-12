The plan is written to `runs/T025/plan.md`. It covers:

- **5 files**: extend `CraSummaryDto` type, new `CraHistory` component + CSS + tests, and a small `App.tsx` wiring change.
- **No new routing library** — state-lifted navigation in `App.tsx` keeps scope minimal.
- **Assumption flagged**: `validationDate` is assumed to already be returned by `GET /api/cras`; if not, the column renders blank without breaking anything.
- All four mandatory headings are present: `## Objective`, `## Included`, `## Excluded`, `## Acceptance criteria`.
