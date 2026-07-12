Plan written to `runs/T025/plan.md`. Key decisions:

- **`validationDate` gap**: T018 omitted this field from the TypeScript `CraSummaryDto` type; T025 adds it since T014 adds it to the backend DTO and the ticket requires displaying it.
- **View-state navigation**: no routing library — follows the deferred-routing pattern established in T019, using `useState<'selector' | 'history'>` in `App.tsx`.
- **PDF download gating**: `status === 'VALIDATED'` check (not `validationDate`) since `CraStatus` is the canonical signal; per-row `downloadingId` state prevents double-clicks.
- **Dependencies explicit**: `listCras()` and `downloadCraPdf()` are out of scope (T018); `GET /api/cras` backend endpoint is out of scope (T014).
