The plan is written to `runs/T025/plan.md`. Here's a summary of what it covers:

**5 files touched:**

1. `frontend/src/api/types.ts` — add `validationDate: string | null` to `CraSummaryDto` (backend already returns it, TS type is the only gap).
2. `frontend/src/components/CraHistory/CraHistory.tsx` — new component with loading/error/empty/table states, "Ouvrir" on every row, "Télécharger PDF" only for `VALIDATED` rows.
3. `frontend/src/components/CraHistory/CraHistory.css` — BEM styles matching existing conventions.
4. `frontend/src/components/CraHistory/CraHistory.test.tsx` — Vitest suite covering all four states and both actions.
5. `frontend/src/App.tsx` — minimal `view: 'selector' | 'history'` toggle with "Historique" / "Retour" buttons; no router library needed.

**Key constraint noted:** `GET /api/cras` and `GET /api/cras/:id/pdf` are already implemented in the backend — no backend work required.
