Plan written to `runs/T019/plan.md`. It covers:

- **T018 dependency assumption** — explicit note that `craClient.ts` / `types.ts` must be available before implementation starts.
- **Test infrastructure changes** — `jsdom` environment in `vite.config.js` + RTL devDependencies needed to test React components.
- **`CraMonthSelector.tsx`** — month/year selects, French period label, `listCras()` on mount, conditional "Ouvrir"/"Créer" button, loading and error states, `onSelectCra` callback prop.
- **`CraMonthSelector.test.tsx`** — Vitest + RTL tests covering all acceptance criteria.
- **`App.jsx`** — replaces bootstrap placeholder with the new component.
- **Excluded** — calendar grid, routing, history page, PDF, backend, signature, i18n.
