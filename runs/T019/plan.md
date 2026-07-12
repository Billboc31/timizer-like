Plan written to `runs/T019/plan.md`. It covers:

- **`CraMonthSelector.tsx`** — month/year selects (French labels), period label, `listCras()` on mount + on change, conditional "Ouvrir"/"Créer" button, loading + error states, `onSelectCra` callback prop.
- **`App.jsx`** — replace placeholder with the new component.
- **Test infrastructure** — add RTL devDependencies + switch `vite.config.js` test environment to `jsdom`.
- **`CraMonthSelector.test.tsx`** — Vitest + RTL tests covering all ticket acceptance criteria.
- **Excluded** — routing, calendar grid, history page, PDF, backend, signature, i18n.
