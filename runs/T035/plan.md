## Objective
Replace the bare `<div>` wrapper in `App.tsx` with a branded `AppShell` component that provides a styled header, accessible navigation with active-state highlighting, a constrained content area, consistent page titles, and a responsive layout that works from 320 px up — without changing any existing component logic or backend APIs.

## Included

### New files
- `frontend/src/components/AppShell/AppShell.tsx` — layout wrapper: branded header, `<nav>` with two nav items ("New CRA", "History"), `<main>` content slot, page title rendering.
- `frontend/src/components/AppShell/AppShell.css` — shell styles: brand colors, nav active indicator, max-width content container, media queries for 320 px / 375 px / 768 px / 1280 px.

### Modified files
- `frontend/src/App.tsx` — import and render `AppShell`; pass `activeView` and `onNavigate` props so the shell can highlight the correct nav item. Remove the raw `<div>`, `<h1>`, `<nav>`, and bare `<button>` elements.
- `frontend/src/App.css` — remove rules now handled by `AppShell.css`; keep only App-level layout rules for the two-panel split (left nav panel / right detail panel).
- `frontend/src/index.css` — add CSS custom properties (brand color, spacing scale, focus ring) and a minimal CSS reset (box-sizing, margin: 0).

### AppShell component interface
```ts
interface AppShellProps {
  activeView: 'selector' | 'history';
  onNavigate: (view: 'selector' | 'history') => void;
  children: React.ReactNode;
}
```

### Key behaviours
- `<header>` contains the app brand name and the `<nav>`.
- Each nav item is a `<button>` with `aria-current="page"` when active and a visible focus ring (`:focus-visible`).
- Active item has a visually distinct style (bottom border + bold weight, or background chip).
- `<main>` uses `max-width` + auto margins to constrain the content area.
- A `<h2>` page title is rendered inside `<main>` based on `activeView`.
- Responsive: single-column stacked layout at ≤ 768 px; two-column at wider widths. No element has a fixed width that causes horizontal overflow at 320 px.
- Nav items remain always visible (no hamburger / collapsed menu) — ticket requirement.

### No changes to
- Existing component files (`CalendarGrid`, `CraHistory`, `CraMonthSelector`, `CraSummaryPanel`, `CraValidation`) — zero logic changes.
- API layer (`api/`).
- `vite.config.ts`, `tsconfig.app.json`.

## Excluded
- Introducing a routing library (React Router or equivalent) — state-based view switching is retained.
- Redesigning the calendar content or any existing component internals.
- Backend API changes.
- Authentication / user management.
- Any new screens or views beyond the two that exist (`selector`, `history`).
- Dark mode or theming system.

## Acceptance criteria
- All five existing components (`CraMonthSelector`, `CraHistory`, `CraSummaryPanel`, `CalendarGrid`, `CraValidation`) render inside `AppShell` with no functional regression.
- The nav shows "New CRA" and "History"; the active item is visually distinct from the inactive one.
- The active nav item carries `aria-current="page"`.
- Both nav items are reachable and activatable via keyboard (Tab + Enter/Space).
- A visible focus ring appears on nav items when focused via keyboard (`:focus-visible`).
- At 320 px viewport width: no horizontal scrollbar, all content is readable and reachable.
- At 768 px and 1280 px: layout uses the available width without overflow.
- A `<h2>` page title appears in the content area corresponding to the active view.
- Existing Vitest tests (`src/components/**/__tests__`) pass without modification.
