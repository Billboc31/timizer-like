All 61 tests pass. Here's a summary of what was implemented:

---

**Files created:**
- `frontend/src/components/AppShell/AppShell.tsx` — branded header with `<nav>` (two buttons with `aria-current="page"` on the active item), a `<main>` constrained to `--content-max-width`, and a `<h2>` page title driven by `activeView`.
- `frontend/src/components/AppShell/AppShell.css` — shell styles: brand color header, active nav indicator (bottom border + bold), hover state, `:focus-visible` ring, `max-width` + auto-margin main, media queries at 768 px and 375 px.

**Files modified:**
- `frontend/src/App.tsx` — replaced the raw `<div>/<h1>/<nav>/<button>` with `<AppShell activeView={view} onNavigate={setView}>`, passing all existing children unchanged.
- `frontend/src/App.css` — cleared the generic `header`/`main` element rules that would have conflicted with AppShell's class-based styles.
- `frontend/src/index.css` — added CSS custom properties (`--color-brand`, `--space-*`, `--content-max-width`, `--focus-ring`) and a `box-sizing: border-box` reset.

**Zero changes** to any existing component, API layer, or test files.
