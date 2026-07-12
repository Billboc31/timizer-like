The plan is written to `runs/T022/plan.md`. Here's a summary of what it covers:

**4 changes across 4 files:**
1. `frontend/src/api/types.ts` — extend `CraDetailsDto` with provider/client fields (currently absent from the DTO but present in the backend entity)
2. `frontend/src/components/CraSummaryPanel.tsx` (new) — purely presentational component accepting `cra | null`, `loading`, `error` as props; rerenders automatically when `totalWorkedDays` changes
3. `frontend/src/App.jsx` — wire up state + `getCra()` call on mount, render the panel
4. `frontend/src/components/__tests__/CraSummaryPanel.test.tsx` (new) — Vitest tests for loading, error, happy path, and prop-update reactivity

**Key flag**: the `CraDetailsDto` from `getCra()` does not currently include provider/client fields. The plan notes as assumption A2 that the backend endpoint must return these — if it doesn't, a companion backend task is needed.
