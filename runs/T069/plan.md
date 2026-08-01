Now I have the full picture. Writing the plan.

## Objective

Add a persistent "Accueil" navigation entry to the sidebar and make the application logo/brand clickable, so every authenticated screen provides a clear, keyboard-accessible route back to the annual-calendar overview (`'overview'` view) without creating or modifying CRA data.

## Included

**`frontend/src/components/AppSidebar/AppSidebar.tsx`**
- Add an "Accueil" `<button>` as the first item inside `<nav>`, calling `handleNavClick('overview')`.
- Apply `aria-current={activeView === 'overview' ? 'page' : undefined}` to this button.
- Convert the static `<div className="app-sidebar__brand">` (line 86) into a `<button>` with `onClick={() => handleNavClick('overview')}`, `aria-label="Retour à l'accueil"`, and the existing brand text. Ensure it has `tabIndex={0}` and keyboard-activatable semantics via `<button>`.

**`frontend/src/components/AppShell/AppShell.tsx`**
- Convert the static `<span className="app-shell__brand">` in the mobile topbar (line 55) into a `<button>` that calls `onNavigate('overview')` and closes the sidebar (`setSidebarOpen(false)`).
- Add `aria-label="Retour à l'accueil"` to the mobile brand button.

**`frontend/src/components/AppSidebar/AppSidebar.css`**
- Add a style rule for the brand-as-button: reset button appearance, retain visual identity, add `cursor: pointer` and `:focus-visible` outline.
- Add an active/highlighted variant for the "Accueil" nav item when `aria-current="page"` is set (consistent with existing active styling for other nav items).

**`frontend/src/components/AppShell/AppShell.css`**
- Add `cursor: pointer` and focus outline for the mobile brand button.

No new files. No changes to routing logic, CRA creation flow, `AppView` type, or any backend code.

## Excluded

- Introducing a URL router (React Router or similar) — navigation remains state-based.
- Browser history / URL synchronization — no `window.history` manipulation.
- Changing the `AppView` type definition or adding new views.
- Any change to CRA creation, modification, or deletion logic.
- Restyling or redesigning the sidebar beyond the new entry and brand button.
- Icon library integration — a Unicode or inline SVG house icon is acceptable; no new dependency.

## Acceptance criteria

- The sidebar `<nav>` contains an "Accueil" button that, when clicked, sets the active view to `'overview'` on both desktop and mobile.
- Clicking the "Timizer Like" brand in the sidebar or in the mobile topbar also navigates to `'overview'`.
- The "Accueil" button carries `aria-current="page"` when `activeView === 'overview'`, and no `aria-current` attribute otherwise.
- All other nav items retain their existing `aria-current` behaviour unchanged.
- Both brand-as-button elements have an `aria-label` and are activatable via keyboard (Enter/Space).
- Navigating to `'overview'` does not trigger `onNewCra`; no CRA is created or modified.
- The mobile sidebar auto-closes after the "Accueil" button is clicked (same behaviour as existing nav items).
- On mobile, tapping the brand in the topbar navigates home and does not open the sidebar.
