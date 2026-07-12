Plan written to `runs/T025/plan.md`. Key decisions grounded in the actual codebase:

- **`react-router-dom` addition** — not yet in `package.json`, must be added before routing works.
- **`CraSummaryDto` type fix** — `validationDate` is returned by the backend (`CraSummaryDto.java`) but missing from the frontend `types.ts`.
- **No backend work** — `GET /api/cras` and `GET /api/cras/:id/pdf` are already implemented; `listCras()` and `downloadCraPdf()` are already wired in `craClient.ts`.
- **Three new files** — `useCraHistory.ts`, `HistoryPage.tsx`, plus their test files — plus minimal changes to `main.tsx`, `App.tsx`, and `types.ts`.
