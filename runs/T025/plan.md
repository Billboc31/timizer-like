The plan has been written to `runs/T025/plan.md`. Key decisions:

- **React Router** must be installed — needed for the `/history` route and the "open CRA" link per row.
- **`CraSummaryDto`** gets `validationDate: string | null` added on the frontend side only (backend already returns it).
- Three new files: `HistoryPage.tsx` (page), `CraHistoryTable.tsx` (table), `CraHistoryRow.tsx` (row with actions).
- "Open CRA" navigates to a stub `/cra/:id` route — detail page is explicitly excluded.
- PDF download uses the existing `downloadCraPdf()` + object URL pattern.
