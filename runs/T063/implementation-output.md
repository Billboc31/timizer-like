Implementation is complete. Here's a summary:

---

## Files created / modified

**Created:**
- `frontend/src/components/AppSidebar/AppSidebar.tsx` — new sidebar component with desktop persistent layout, mobile drawer with Escape/backdrop/focus-trap, `aria-current` active state, and keyboard-accessible nav items
- `frontend/src/components/AppSidebar/AppSidebar.css` — desktop: 220px sticky column; mobile (≤767px): fixed off-screen panel with CSS transition + semi-transparent backdrop overlay

**Modified:**
- `frontend/src/components/AppShell/AppShell.tsx` — removed `<header>`, added `<AppSidebar>` + mobile topbar with hamburger button, changed root layout to `flex-direction: row`
- `frontend/src/components/AppShell/AppShell.css` — root becomes `height: 100vh; flex-direction: row`; main gets `flex: 1; overflow-y: auto; min-width: 0`; mobile topbar is sticky; removed all old `__header`/`__nav`/`__nav-item` rules

**Unchanged:** `App.tsx`, all view components, `tokens.css`, `base.css` — view state wiring is unmodified.

**Verifications:** No TypeScript errors in modified files; all 278 existing tests pass.
