# Plan — T063: Move application navigation to a responsive left sidebar

## Objective

Replace the horizontal top navigation in `AppShell` with a persistent vertical sidebar on the left that exposes all existing navigation destinations, a prominent "New CRA" action, and a collapsible drawer on mobile viewports.

## Included

### New component: `AppSidebar`

**`frontend/src/components/AppSidebar/AppSidebar.tsx`** (create)

- Props: `activeView: AppView`, `onNavigate: (view: AppView) => void`, `isOpen: boolean`, `onClose: () => void`
- Renders a `<nav aria-label="Main navigation">` containing:
  - Brand name / logo mark at the top
  - Prominent "New CRA" button (navigates to `'selector'` view; styled as primary CTA)
  - "History" link (navigates to `'history'`)
  - "Paramètres" link (navigates to `'settings'`)
- Each nav item carries `aria-current="page"` when it matches `activeView`
- Every interactive element has a visible `:focus-visible` outline
- On mobile, the `<nav>` is rendered inside a `<dialog>` (or `role="dialog"`) drawer; focus is trapped while open; `Escape` closes it
- Clicking a nav item calls `onNavigate(view)` then `onClose()` on mobile

**`frontend/src/components/AppSidebar/AppSidebar.css`** (create)

Desktop (≥ 768px, `--bp-md`):
- Sidebar: fixed width ~220 px, full viewport height, `position: sticky; top: 0; height: 100vh`, flex column layout
- Background: `var(--color-header-bg)`, border-right: `1px solid var(--color-header-border)`
- "New CRA" item styled as primary button (filled, `var(--color-primary)`)
- Navigation links: `aria-current="page"` gets left accent border + bold weight
- Hover: `var(--color-primary-light)` background

Mobile (< 768px):
- Sidebar is off-screen by default (`transform: translateX(-100%)`)
- When open (`--is-open` class or `data-open` attribute): slides in via CSS transition (`transform: translateX(0)`)
- A semi-transparent backdrop overlay (`position: fixed; inset: 0`) closes the drawer on click
- A hamburger `<button>` in the thin mobile top bar toggles `isOpen`

### Modifications to `AppShell`

**`frontend/src/components/AppShell/AppShell.tsx`** (modify)

- Add local state `const [sidebarOpen, setSidebarOpen] = useState(false)` for mobile drawer control
- Replace `<header className="app-shell__header">…</header>` with:
  - `<AppSidebar activeView={activeView} onNavigate={onNavigate} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />`
  - A minimal mobile-only top bar (`<div className="app-shell__mobile-topbar">`) containing the hamburger toggle button and brand name, visible only on < 768 px
- Change root element layout from `flex-direction: column` to `flex-direction: row`
- `<main>` stays as-is; it will receive `flex: 1` and its own vertical scroll

**`frontend/src/components/AppShell/AppShell.css`** (modify)

- `.app-shell`: change to `display: flex; flex-direction: row; min-height: 100vh`
- Remove all `.app-shell__header`, `.app-shell__nav`, `.app-shell__nav-item` rules (moved to AppSidebar)
- `.app-shell__main`: remove `margin: 0 auto; max-width`; add `flex: 1; overflow-y: auto; min-width: 0`
- Add `.app-shell__mobile-topbar`: `display: none` on desktop; `display: flex; align-items: center` on < 768 px

### No changes required

- `App.tsx` — view state management and `onNavigate` wiring remain unchanged
- `main.tsx` — routing logic unchanged
- `PageHeader` component — unchanged (still rendered inside `<main>`)
- All existing view components (`CraMonthSelector`, `CraHistory`, settings forms) — unchanged
- `tokens.css`, `base.css` — unchanged; existing CSS variables are reused

## Excluded

- Implementing or redesigning the CRA period-selection dialog (dependency note: sidebar "New CRA" button navigates to existing `'selector'` view until a dialog is provided by a separate ticket)
- Collapsible/collapsed desktop mode (acceptable per ticket but not required)
- Any redesign of page content or individual view components
- Role-based or user-configurable menu ordering
- Icon additions (no icon library is currently used; labels only unless SVG icons are already available)

## Acceptance criteria

- The horizontal top navigation bar (`app-shell__header`) is gone; no `<header>` element renders navigation links
- On desktop (≥ 768 px), the sidebar is permanently visible on the left; the main content area scrolls independently
- On mobile (< 768 px), a hamburger button is visible in a thin top bar; tapping it opens the sidebar as a full-height drawer overlay; the drawer can be closed via the Escape key, a backdrop click, or by selecting a nav item
- All three navigation destinations (New CRA → selector, History, Paramètres) are reachable from the sidebar
- The active view is visually distinguishable from inactive items (accent border or highlighted state)
- Keyboard-only users can Tab through all sidebar items; every item has a visible focus ring; the mobile drawer traps focus while open
- Every sidebar interactive element has an accessible label (`aria-label` or visible text)
- Existing routes and deep links continue to function (view state logic in `App.tsx` is unmodified)
- No TypeScript errors; existing tests continue to pass
