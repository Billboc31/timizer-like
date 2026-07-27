Plan written to `runs/T034/plan.md`.

**Summary of what the plan covers:**

- **New file `styles/tokens.css`** — all CSS custom properties: colours, typography, spacing, radii, shadows, focus ring, transitions, and breakpoint documentation.
- **New file `styles/base.css`** — utility classes for page layout, cards, buttons (4 variants + disabled), form fields (5 states), badges, tables, dialogs, and empty states.
- **`index.css` update** — imports both new files and drops hardcoded values.
- **4 existing CSS files** — adopt tokens in place of hardcoded hex/px literals.
- **No framework, no CSS modules, no JSX changes** — stays within the project's plain-CSS convention.
