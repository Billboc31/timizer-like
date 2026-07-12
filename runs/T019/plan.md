The plan has been written to `runs/T019/plan.md`. It covers:

- **`CraMonthSelector.tsx`** — new TypeScript component with French month labels, year range selector, period label, conditional "Ouvrir"/"Créer" button, loading/error states, and an `onOpen` callback prop for future navigation.
- **`App.jsx`** — replace the Bootstrap placeholder with the new component.
- **`CraMonthSelector.test.tsx`** — Vitest + RTL tests covering all acceptance criteria, with the required `jsdom` environment switch in `vite.config.js` and new dev dependencies.
- **Hypothesis flagged** — `listCras()` is marked as pending backend implementation; the component must handle rejection gracefully.
- **Excluded** — day-entry UI, history page, PDF, backend, client signature, routing, i18n.
