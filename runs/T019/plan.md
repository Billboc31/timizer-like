Plan written to `runs/T019/plan.md`. It covers:

- **Conditional T018 dependency** — explicit assumption that if the API client stubs aren't merged, T019 creates `types.ts`, `httpClient.ts`, and `craClient.ts` first.
- **`CraMonthSelector.tsx`** — month/year selects, period label, `listCras()` on mount to detect existing CRAs, conditional "Ouvrir" vs "Créer" button, loading and error states.
- **`App.jsx` integration** — swap the bootstrap placeholder for the new component.
- **`CraMonthSelector.test.tsx`** — Vitest + RTL tests covering all acceptance criteria.
- **Excluded** — calendar grid, routing, history page, PDF, backend changes, i18n.
