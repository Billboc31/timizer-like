# T046 — Plan: Replace the dark interface with a modern light visual theme

## Objective

Force the application to render exclusively in light mode and apply a coherent, modern SaaS visual theme — clean white/off-white surfaces, subtle shadows, consistent accent colour, and full token coverage across all component stylesheets.

## Included

### Root cause fix

- **`frontend/src/index.css`**
  - Change `color-scheme: light dark` → `color-scheme: light` to prevent the browser from switching to dark defaults when the OS is in dark mode.
  - Add `background-color: var(--color-bg); color: var(--color-text);` to the `body` rule so the base canvas is always light.

### Token refresh (`frontend/src/styles/tokens.css`)

Update semantic surface/layout tokens for a modern SaaS palette:

| Token | Old value | New value | Rationale |
|---|---|---|---|
| `--color-bg` | `#f3f4f6` | `#f8fafc` | Lighter, more airy page background |
| `--color-border` | `#e5e7eb` | `#e2e8f0` | Slightly cooler, more contemporary border |
| `--radius-lg` | `8px` | `10px` | Softer card corners |
| `--shadow-sm` | current | `0 1px 3px 0 rgb(0 0 0 / 0.06)` | More delicate lift |
| `--shadow-md` | current | `0 4px 12px -2px rgb(0 0 0 / 0.08)` | Softer card shadow |

Add new tokens:

| Token | Value | Purpose |
|---|---|---|
| `--color-header-bg` | `#ffffff` | AppShell header background |
| `--color-header-border` | `#e2e8f0` | AppShell header bottom border |
| `--color-header-text` | `#111827` | AppShell header text / nav items |
| `--color-header-text-muted` | `#6b7280` | AppShell nav inactive items |
| `--color-header-accent` | `#2563eb` | Active nav underline / brand dot |
| `--color-success-bg` | `#d1fae5` | Validated-badge background |
| `--color-success-text` | `#065f46` | Validated-badge text |

### AppShell (`frontend/src/components/AppShell/AppShell.css`)

- Replace `.app-shell__header` background from `var(--color-brand)` to `var(--color-header-bg)`, set `color: var(--color-header-text)`, add `border-bottom: 1px solid var(--color-header-border)` and `box-shadow: var(--shadow-sm)`.
- Update `.app-shell__brand` to use `color: var(--color-primary)` (brand accent).
- Update `.app-shell__nav-item` colours to `var(--color-header-text-muted)`.
- Update `.app-shell__nav-item[aria-current='page']` to `color: var(--color-header-text); border-bottom-color: var(--color-header-accent)`.
- Replace hover `rgba(255,255,255,0.12)` with `var(--color-primary-light)`.

### CalendarGrid (`frontend/src/components/CalendarGrid/CalendarGrid.css`)

Replace every hardcoded hex value with a CSS token or a scoped CSS variable. Specific replacements:

| Selector / property | Old value | Replacement |
|---|---|---|
| `.calendar-header` color | `#222` | `var(--color-text)` |
| `.calendar-grid__weekday-header` color | `#666` | `var(--color-text-muted)` |
| `.day-cell` border | `#e0e0e0` | `var(--color-border)` |
| `.day-cell` background | `#fff` | `var(--color-surface)` |
| `.day-cell--worked` bg/border | `#2563eb` / `#1d4ed8` | `var(--color-primary)` / `var(--color-primary-hover)` |
| `.day-cell--half` bg/border/color | `#bfdbfe` / `#93c5fd` / `#1e3a8a` | `var(--color-primary-light)` / `#93c5fd` → new `--color-primary-border` token / `var(--color-primary)` |
| `.day-cell--rest` bg/border/color | `#fff` / `#e0e0e0` / `#222` | `var(--color-surface)` / `var(--color-border)` / `var(--color-text)` |
| `.day-cell--weekend` bg/border/color | `#f0f0f0` / `#ddd` / `#555` | `var(--color-neutral-100)` / `var(--color-neutral-300)` / `var(--color-text-muted)` |
| `.day-cell--rest:hover` bg/border | `#eff6ff` / `#93c5fd` | `var(--color-primary-light)` / `var(--color-primary)` |
| `.calendar-legend__item` color | `#444` | `var(--color-text-muted)` |
| `.calendar-legend__swatch--*` | hardcoded | mirror corresponding day-cell tokens |
| `.calendar-grid__day-update-error` color | `#c0392b` | `var(--color-error)` |

Add `--color-primary-border: #93c5fd` to `tokens.css`.

### CraSummaryPanel (`frontend/src/components/CraSummaryPanel/CraSummaryPanel.css`)

Replace all hardcoded hex values with tokens:

| Property | Old value | Replacement |
|---|---|---|
| panel background | `#fff` | `var(--color-surface)` |
| panel border | `#e5e7eb` | `var(--color-border)` |
| panel border-radius | `8px` | `var(--radius-lg)` |
| title color | `#374151` | `var(--color-neutral-700)` |
| period color | `#6b7280` | `var(--color-text-muted)` |
| hero border | `#f3f4f6` | `var(--color-bg)` |
| hero value color | `#111827` | `var(--color-text)` |
| hero label color | `#6b7280` | `var(--color-text-muted)` |
| badge--draft | `#fef3c7` / `#92400e` | `var(--color-warning-light)` / `var(--color-warning-text)` |
| badge--validated | `#d1fae5` / `#065f46` | `var(--color-success-bg)` / `var(--color-success-text)` |
| meta dt color | `#6b7280` | `var(--color-text-subtle)` |
| meta dd color | `#111827` | `var(--color-text)` |
| loading color | `#6b7280` | `var(--color-text-muted)` |
| error bg/border/color | `#fef2f2` / `#fecaca` / `#dc2626` | `var(--color-error-light)` / `var(--color-error-border)` / `var(--color-error)` |

### CraHistory (`frontend/src/components/CraHistory/CraHistory.css`)

- Replace `.cra-history__badge--validated` background `#d1fae5` → `var(--color-success-bg)` and color `#065f46` → `var(--color-success-text)`.

### CraValidation (`frontend/src/components/CraValidation/CraValidation.css`)

- Replace `.cra-validation__success` background `#dcfce7` → `var(--color-success-bg)`, border `#86efac` → `var(--color-success-border)`, color `#15803d` → `var(--color-success-text)`.

### Visual regression tests (`frontend/src/tests/visual/` or similar)

- Update any screenshot baselines that exist for the affected screens after the theme change. Do not modify test logic, only baseline snapshots.

## Excluded

- Adding a user-selectable dark mode toggle.
- Changing any CRA business rules, data models, or backend APIs.
- Modifying test logic (only snapshot baselines may be refreshed).
- Redesigning layout structure, spacing scale, or typography sizes.
- Replacing the primary accent colour (#2563eb).

## Acceptance criteria

- `color-scheme` in `index.css` is `light` (not `light dark`).
- `body` has an explicit light `background-color` and `color` set.
- All tokens added to `tokens.css` are present and syntactically valid.
- AppShell header renders white with a subtle bottom border/shadow — no blue background.
- `CalendarGrid.css` contains no hardcoded hex colour values.
- `CraSummaryPanel.css` contains no hardcoded hex colour values.
- `CraHistory.css` and `CraValidation.css` contain no hardcoded hex colour values outside of rgba/box-shadow opacity shorthand.
- Running the app with the OS in dark mode still shows a light interface.
- Visual review of desktop and mobile viewports confirms a coherent, calm, professional appearance.
- `npm test` (or equivalent) passes with no new failures.
