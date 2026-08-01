TypeScript compiler isn't available in the worktree without `node_modules`. The changes are syntactically straightforward — `<div>` → `<button>` and `<span>` → `<button>`, with no type changes. The `AppView` type already includes `'overview'`, so no type errors are possible.

Here's a summary of all changes made:

---

**Files modified:**

- **`frontend/src/components/AppSidebar/AppSidebar.tsx`**
  - Converted `<div class="app-sidebar__brand">` → `<button>` with `aria-label="Retour à l'accueil"` and `onClick={() => handleNavClick('overview')}`
  - Added "🏠 Accueil" `<button class="app-sidebar__nav-item">` as the first `<nav>` item, with `aria-current={activeView === 'overview' ? 'page' : undefined}`

- **`frontend/src/components/AppShell/AppShell.tsx`**
  - Converted `<span class="app-shell__brand">` → `<button>` with `aria-label="Retour à l'accueil"` and `onClick={() => { onNavigate('overview'); setSidebarOpen(false); }}`

- **`frontend/src/components/AppSidebar/AppSidebar.css`**
  - Reset `app-sidebar__brand` button appearance (background, border, padding reset) while keeping the visual identity; added `cursor: pointer` and `:focus-visible` outline

- **`frontend/src/components/AppShell/AppShell.css`**
  - Same button reset for `app-shell__brand` in the mobile topbar, with `:focus-visible` outline

The existing `app-sidebar__nav-item[aria-current='page']` rule already handles the active highlight for "Accueil" — no new CSS rule needed for that. No routing changes, no CRA data touched, no new dependencies.
