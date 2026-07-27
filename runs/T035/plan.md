Plan written to `runs/T035/plan.md`. Key decisions made from codebase exploration:

- **No routing library** — the app uses `useState`-based view switching; a router adds zero value for two views and would be scope creep.
- **New `AppShell` component** — a header with brand + `Nav`, a constrained `<main>`. Two new files (`AppShell.tsx`, `Nav.tsx`) plus one CSS file, keeping the component-per-folder convention.
- **`App.tsx` slim-down** — removes the inline `<h1>` and `<nav>`, delegates them to `AppShell`.
- **`index.css` global reset** — `box-sizing: border-box` and `overflow-x: hidden` to guarantee no horizontal scroll at 320 px.
- **Plain CSS only** — matches the existing styling approach; no new framework dependency.
