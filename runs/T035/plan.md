Plan written to `runs/T035/plan.md`. Summary of the approach:

- **New `AppShell` component** (`AppShell.tsx` + `AppShell.css`) — header with brand, `<nav>` with two `<button>` items, `<main>` with max-width constraint. No React Router needed since the app uses state-based navigation.
- **`App.tsx` refactored** — wrapped in `AppShell`, inline `<h1>` and `<nav>` removed, a `<h1>` page title added to each view branch.
- **CSS custom properties** added to `index.css` for the shell palette.
- **Mobile at 320 px** covered via `flex-wrap` on nav and no fixed widths in the content area.
- **Keyboard access** via native `<button>` elements (already focusable) and `:focus-visible` ring styles.
