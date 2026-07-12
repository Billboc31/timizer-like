Plan written to `runs/T025/plan.md`. Key decisions anchored in the actual codebase:

- **`react-router-dom` must be added** — it's absent from `package.json` on the T018 branch (the most advanced frontend branch).
- **`CraSummaryDto` type fix** — the backend already returns `validationDate` (confirmed in T014's `CraSummaryDto.java`), but the frontend `types.ts` doesn't declare it yet.
- **`GET /api/cras`** and **`GET /api/cras/:id/pdf`** already exist and `listCras()` / `downloadCraPdf()` are already wired in `craClient.ts` — no backend work needed.
- Three new component files + two test files, plus minimal changes to `main.jsx`, `App.jsx`, and `types.ts`.
