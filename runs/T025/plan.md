The plan is written to `runs/T025/plan.md`. Key decisions captured:

- **`validationDate` gap fixed**: backend `CraSummaryDto.java` already returns the field; the plan adds it to the frontend TypeScript type in `frontend/src/api/types.ts`.
- **No router**: history view uses `useState<'selector' | 'history'>` in `App.tsx`, consistent with the pattern established in T019.
- **PDF gating**: `status === 'VALIDATED'` check (not `validationDate`) as the canonical signal; per-row `downloadingId` prevents double-clicks.
- **5 files**: one new component (tsx + css + test), one type extension, one App.tsx update.
