The plan is written to `runs/T034/plan.md`. Here's a summary:

**Approach:** Two new files + token adoption across existing CSS.

- **`frontend/src/styles/tokens.css`** — CSS custom properties for colours, typography, spacing scale (4–32px), border radius, shadows, focus ring, and breakpoint reference values.
- **`frontend/src/styles/base.css`** — Reusable utility classes: `.btn` (primary/secondary/danger/disabled), `.input` (default/hover/focus/disabled/error), `.card`, `.badge` (status variants), `.table`, `.dialog`, `.empty-state`, `.page`, plus a global `*:focus-visible` rule.
- **5 existing CSS files** migrated to `var(--...)` references in place of hardcoded hex colours and raw spacing.

No new library introduced, no JSX edits, no screen rebuilds — purely the token and base-style layer.
