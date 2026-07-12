Plan written to `runs/T022/plan.md`.

Key decisions in the plan:

- **Props-driven design**: `CraSummaryPanel` is a pure presentational component receiving `cra: CraDetailsDto | null`, `loading`, and `error` — the total updates automatically when the parent passes a new prop after a day change, no internal state needed.
- **Risk flagged**: `CraDetailsDto` in `frontend/src/api/types.ts` currently lacks `providerName`, `providerCompany`, and `clientName`. The plan requires verifying those fields exist in the backend API response before extending the frontend type.
- **Tests**: Vitest + `@testing-library/react` (may need to be added as a dev dependency).
