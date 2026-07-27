# Test Report — T034: Introduce a professional frontend design system

## Date
2026-07-27

## Verification method
- Static file inspection of all created and modified CSS files
- `npx vite build` inside `frontend/` (CSS resolution and bundling)
- `npm run build` (full `tsc -b && vite build`) to characterise TS behaviour
- `grep` scan for residual hardcoded hex values in component CSS files

---

## Acceptance criteria

### AC1 — Shared design tokens defined in one central location
**PASS**

`frontend/src/styles/tokens.css` declares all CSS custom properties in a single `:root` block: colour palette (brand, neutral, semantic), typography scale, spacing (`--space-1` to `--space-16`), border-radius, shadows, border, focus ring, and responsive breakpoints.

---

### AC2 — Typography and spacing scales are consistent
**PASS**

- Font sizes: `--font-size-xs` (0.75rem) → `--font-size-2xl` (1.5rem), 6 steps
- Font weights: normal / medium / semibold / bold (400 / 500 / 600 / 700)
- Line heights: tight / base / relaxed (1.25 / 1.5 / 1.75)
- Spacing: `--space-1` (0.25rem) → `--space-16` (4rem), 16 steps in 0.25rem increments

All component CSS files consume these tokens; no hardcoded sizes found outside `tokens.css`.

---

### AC3 — Primary, secondary, destructive, and disabled button styles exist
**PASS**

`frontend/src/styles/base.css` provides:
- `.btn-primary` — blue background, white text, hover state
- `.btn-secondary` — grey background, white text, hover state
- `.btn-destructive` — red background, white text, hover state
- `.btn:disabled` — 0.6 opacity, `cursor: not-allowed`

---

### AC4 — Form fields have default, hover, focus, disabled, and error states
**PASS**

`.input` in `base.css` covers all required states:
- Default: border `var(--border-color)`, white background
- Hover: `border-color: var(--color-neutral-400)`
- Focus / focus-visible: `border-color: var(--color-primary)` + `box-shadow: var(--focus-ring)`
- Disabled: 0.6 opacity, `cursor: not-allowed`, neutral-100 background
- Error (`.input--error`): red border + red focus ring

---

### AC5 — Cards, badges, tables, and dialogs have reusable styles
**PASS**

- **Card**: `.card`, `.card-header`, `.card-body`, `.card-footer`
- **Badge**: `.badge` + `.badge-success`, `.badge-warning`, `.badge-error`, `.badge-neutral`
- **Table**: `.table` with thead styling, `tbody td` padding, `tbody tr:hover` highlight
- **Dialog**: `.dialog-overlay` (fixed, semi-transparent) + `.dialog` (surface, rounded, shadow)
- **Empty state**: `.empty-state`, `.empty-state-icon`, `.empty-state-title`, `.empty-state-body`

---

### AC6 — Focus indicators remain visible and accessible
**PASS**

`:focus-visible` is applied on both interactive elements:
- `.btn:focus-visible` → `box-shadow: var(--focus-ring)` (3px blue ring at 40% opacity)
- `.input:focus-visible` → same ring, plus primary border colour

`outline: none` is paired with the custom box-shadow ring on every focus rule, so keyboard navigation remains visible.

---

### AC7 — Existing screens still compile after the design system is introduced
**PASS with note**

- `npx vite build` exits **0** — all CSS imports resolve, 9.65 kB CSS bundle produced, no warnings.
- `npm run build` (`tsc -b && vite build`) exits **1** due to a TypeScript error in `frontend/src/api/httpClient.ts` (`Cannot find name 'process'`). This error was introduced by ticket T018 (commit `be9c0f8c`), is present on the base branch, and is entirely unrelated to the design system. T034 adds no TypeScript files.

---

## Regressions observed
None. All five existing component CSS files (`App.css`, `CalendarGrid.css`, `CraHistory.css`, `CraValidation.css`, `index.css`) were migrated to token variables with no residual hardcoded hex values outside of `tokens.css`.

## Non-blocking observations (inherited from implementation review)
1. CSS custom properties cannot be interpolated inside `@media` queries — `var(--bp-sm)` defined in `tokens.css` will not work there. No current `@media` uses them, so there is no runtime issue, but future consumers could be misled.
2. Two `rgb()` values remain hardcoded in `base.css` (dialog overlay and error focus ring). Consistent with the palette but not tokenised.
3. `color-scheme: light dark` in `index.css` may trigger browser dark mode without dark tokens. This is aesthetic only; no functional impact.

---

## Verdict
**APPROVED — all 7 acceptance criteria are satisfied. No blocking issue found.**
