Plan written to `runs/T022/plan.md`. It covers 4 files:

1. **`types.ts`** — extend `CraDetailsDto` with `providerName`, `providerCompany`, `clientName`
2. **`CraSummaryPanel.tsx`** (new) — presentational component accepting `cra | null`, `loading`, `error` as props
3. **`CraSummaryPanel.test.tsx`** (new) — Vitest tests for loading / error / data states
4. **`App.jsx`** — wire up `getCra()` on mount, pass state to the panel, update state after `updateDay()`
