I have enough data to write the full review.

---

# PR Review — T046: Replace the dark interface with a modern light visual theme

## 1. Scope compliance

The implementation is tightly scoped to the ticket. No CRA business logic, backend APIs, or layout structure was touched. The 7 files modified correspond exactly to those listed in the plan. No scope drift detected.

## 2. Ticket acceptance criteria

| Criterion | Status | Evidence |
|---|---|---|
| Default background is light | ✓ | `color-scheme: light`; `body { background-color: var(--color-bg) }` (`#f8fafc`) |
| Content surfaces use coherent hierarchy | ✓ | `--color-bg` / `--color-surface` / `--color-neutral-*` hierarchy defined in tokens and applied consistently |
| Text contrast accessible | ✓ | `#111827` on `#ffffff`/`#f8fafc` is high-contrast; muted text on light backgrounds is standard |
| Borders and shadows subtle and consistent | ✓ | All via tokens: `--color-border: #e2e8f0`, `--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.06)` |
| Buttons, inputs, dialogs, cards, tables, calendar states follow new theme | ✓ | `base.css` (buttons, inputs, tables, dialogs), all component CSS files fully tokenised |
| No component retains accidental dark-theme style | ✓ | Grep confirms no hardcoded dark hex values outside token definitions |
| Visual coherence | ✓ (code-level) | Design is sound; runtime screenshot verification is deferred to QA |

## 3. Plan compliance

All planned changes are implemented:

- **`index.css`**: `color-scheme: light` ✓; `body` has `background-color` and `color` via tokens ✓
- **`tokens.css`**: All new tokens present (`--color-header-*`, `--color-success-bg`, `--color-success-text`, `--color-primary-border`); `--radius-lg: 10px`, `--shadow-sm`, `--shadow-md` updated ✓
- **`AppShell.css`**: White header with bottom border/shadow, brand in `--color-primary`, nav items in `--color-header-text-muted`, active item in `--color-header-accent`, hover in `--color-primary-light` ✓
- **`CalendarGrid.css`**: Zero hardcoded hex values; all day states, legend swatches, and error text tokenised ✓
- **`CraSummaryPanel.css`**: Zero hardcoded hex values; surface, border, badges, hero, meta, error all tokenised ✓
- **`CraHistory.css`**: Validated badge uses `--color-success-bg`/`--color-success-text` ✓
- **`CraValidation.css`**: Success state uses `--color-success-*` tokens; only `rgba()` opacity shorthands remain (explicitly allowed by plan criteria) ✓

## 4. Code quality

- All component CSS files are now fully token-driven — no magic hex values in component files.
- `tokens.css` is well-organised by semantic group; the header tokens are cleanly isolated.
- `base.css` (shared primitives: buttons, inputs, table, dialog) was already token-driven and untouched, which is correct.
- The shimmer skeleton in `CraHistory.css` uses `var(--color-neutral-200)` and `var(--color-bg)` — clean.

## 5. Minor observations (non-blocking)

**a. `--focus-ring` token conflict in `index.css`**
`index.css` line 19 overrides the `--focus-ring` token (defined in `tokens.css` as `0 0 0 3px rgb(37 99 235 / 0.4)`) with `2px solid #f59e0b` (amber). This means inputs using `box-shadow: var(--focus-ring)` in `base.css` get a yellow solid outline instead of the blue ring. This is a pre-existing inconsistency — not introduced by this ticket — and does not cause a dark-theme regression. Follow-up cleanup recommended in a future ticket.

**b. Hardcoded hex in `index.css` `:focus-visible` rule**
Line 35: `outline: 2px solid #2563eb` — this matches `--color-primary` exactly but uses a literal hex. Pre-existing and not in scope here.

**c. `CraMonthSelector.css` uses raw `rem` values**
Spacing is via `1rem`, `0.75rem`, `0.25rem` rather than space tokens. Pre-existing, out of scope for this ticket.

None of these issues were introduced by this implementation. All three existed before T046 and would belong in a separate cleanup ticket.

## 6. Test results

118 tests pass. 2 pre-existing failures (`../../api/cra` import not found) are unrelated to theme changes and were present before this branch.

## 7. Verdict

The implementation faithfully delivers the planned light-theme migration. All hardcoded dark hex values are replaced with semantically named tokens. The token hierarchy is coherent, borders and shadows are restrained, and OS dark-mode is suppressed via `color-scheme: light`. No regressions introduced. No blocking issues.

IMPLEMENTATION_APPROVED
