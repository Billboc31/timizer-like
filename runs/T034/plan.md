## Objective
Define a central set of CSS custom-property design tokens and a small library of reusable base component classes, so all future screens share a consistent visual language without introducing a UI framework.

## Included

**New files**

- `frontend/src/styles/tokens.css` — CSS custom properties covering:
  - Color palette (brand, neutral, semantic: success, warning, error, info)
  - Typography scale (`--font-size-xs` … `--font-size-2xl`, `--font-weight-*`, `--line-height-*`)
  - Spacing scale (`--space-1` … `--space-16`)
  - Border radius (`--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-full`)
  - Shadows (`--shadow-sm`, `--shadow-md`, `--shadow-lg`)
  - Border (`--border-width`, `--border-color`)
  - Focus ring (`--focus-ring`, `--focus-ring-offset`)
  - Responsive breakpoints as custom properties (`--bp-sm: 640px`, `--bp-md: 768px`, `--bp-lg: 1024px`)

- `frontend/src/styles/base.css` — reusable utility classes:
  - Page background (`.page`, `.page-content`)
  - Card (`.card`, `.card-header`, `.card-body`, `.card-footer`)
  - Buttons: `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-destructive`, `.btn:disabled`
  - Inputs: `.input` with `:hover`, `:focus`, `:disabled`, `.input--error` states
  - Badge: `.badge`, `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-neutral`
  - Table: `.table`, `.table thead`, `.table tbody tr:hover`
  - Dialog: `.dialog-overlay`, `.dialog`
  - Empty state: `.empty-state`, `.empty-state-icon`, `.empty-state-title`, `.empty-state-body`

**Modified files**

- `frontend/src/index.css` — add `@import` for `./styles/tokens.css` and `./styles/base.css` at the top; replace any hardcoded values with token variables
- `frontend/src/App.css` — replace hardcoded values with token variables where applicable
- `frontend/src/components/CalendarGrid/CalendarGrid.css` — replace hardcoded colors (`#ddd`, etc.) with tokens
- `frontend/src/components/CraHistory/CraHistory.css` — replace hardcoded colors with tokens
- `frontend/src/components/CraValidation/CraValidation.css` — replace hardcoded colors (`#2563eb`, `#dc2626`, `#fef3c7`, etc.) with tokens

## Excluded

- Rebuilding or restyling individual business screens beyond token substitution
- Changing any application behaviour or TypeScript/React logic
- Introducing a CSS preprocessor (Sass, Less) or a utility-framework (Tailwind, MUI, Chakra)
- Adding animations, transitions, or motion design
- Dark-mode theme (separate ticket)
- Responsive layout changes to existing screens

## Acceptance criteria

- `frontend/src/styles/tokens.css` exists and declares CSS custom properties for colour, typography, spacing, radius, shadow, border, focus, and breakpoints
- `frontend/src/styles/base.css` exists and provides classes for: page background, card, button (primary / secondary / destructive / disabled), input (default / hover / focus / disabled / error), badge (success / warning / error / neutral), table (with hover row), dialog overlay, empty state
- `frontend/src/index.css` imports both new files so tokens and base classes are globally available
- All existing component CSS files reference CSS variables from `tokens.css` instead of the previously hardcoded hex values (`#2563eb`, `#dc2626`, `#ddd`, `#fef3c7`, `#f59e0b`, etc.)
- `npm run build` (or `vite build`) inside `frontend/` exits with code 0 — no compile errors introduced
- Focus indicators (`:focus-visible` ring using `--focus-ring`) are applied on `.btn` and `.input`
