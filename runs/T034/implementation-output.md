Vite build succeeds cleanly — all CSS imports and variables resolve correctly. The TS error (`process` not found in `httpClient.ts`) is pre-existing and out of scope for this ticket.

Here's a summary of what was implemented:

**Files created:**
- `frontend/src/styles/tokens.css` — CSS custom properties: color palette (brand, neutral, semantic), typography scale (6 sizes, 4 weights, 3 line-heights), spacing (--space-1 to --space-16), border radius, shadows, border, focus ring, and breakpoints
- `frontend/src/styles/base.css` — reusable classes: `.page`, `.card`, `.btn` (primary/secondary/destructive/disabled), `.input` (hover/focus/disabled/error), `.badge` (success/warning/error/neutral), `.table` (with hover row), `.dialog-overlay`/`.dialog`, `.empty-state`

**Files modified:**
- `frontend/src/index.css` — added `@import` for both new files, replaced hardcoded `1.5` with `var(--line-height-base)`
- `frontend/src/App.css` — replaced `1rem`/`#ddd`/`1px solid` with token variables
- `frontend/src/components/CalendarGrid/CalendarGrid.css` — replaced all hardcoded sizes and colors
- `frontend/src/components/CraHistory/CraHistory.css` — replaced all hardcoded values
- `frontend/src/components/CraValidation/CraValidation.css` — replaced all hardcoded hex values (`#2563eb`, `#dc2626`, `#fef3c7`, `#f59e0b`, `#6b7280`, etc.)
