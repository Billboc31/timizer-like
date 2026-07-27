Plan written to `runs/T035/plan.md`. Key decisions:

- **No router** — two views don't warrant introducing a routing library; `useState` stays.
- **New `AppShell` component** — `AppShell.tsx` + `AppShell.css` follow the existing component-per-folder convention; `App.tsx` just wraps its children in it.
- **Active state** — CSS class `.nav__link--active` plus `aria-current="page"` covers both visual distinctness and keyboard/screen-reader accessibility.
- **320 px safety** — global `box-sizing: border-box` in `index.css` + fluid widths in AppShell.css; no `overflow-x` clipping that hides content.
- **Dead CSS removed** — `App.css` currently references `header`/`main` selectors that never matched anything (the JSX used `<div>`); those rules will be deleted.
