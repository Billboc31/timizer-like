The plan is written to `runs/T023/plan.md`. It covers:

- **`craClient.ts`** — add `validateCra()` calling `POST /api/cras/{id}/validate`.
- **`CalendarGrid.tsx`** — validate button (DRAFT only), inline confirmation overlay with cancel/confirm, error display, and locked read-only state when VALIDATED.
- **Tests** — 8 new cases covering the full happy path, cancel, error, and locked-state rendering.
- **Excluded** — backend, PDF, signatures, reopen workflow, date picker.
