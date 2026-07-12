The plan has been written to `runs/T025/plan.md`. It covers:

- **Type fix**: add `validationDate: string | null` to `CraSummaryDto` in `api/types.ts`
- **New `CraHistoryTable` component** (`.tsx`, `.css`, `.test.tsx`) — purely presentational, receives `cras`, `loading`, `error`, `onOpen`, `onDownload` as props; handles all three UI states
- **`App.tsx` wiring** — fetches via `listCras()` on mount using the existing `useState`/`useEffect` pattern; implements `onDownload` with `downloadCraPdf()` and a temporary anchor trigger; delegates `onOpen` to the existing CRA detail flow
- **Excluded**: React Router, backend changes, filters/search, design system work
