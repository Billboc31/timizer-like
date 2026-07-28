128/128 tests pass. The 2 pre-existing axe test failures (`CraHistory.axe.test.tsx`, `CraMonthSelector.axe.test.tsx`) reference a non-existent `../../api/cra` module — confirmed pre-existing on the base commit before any of my changes.

---

## Summary

**Files created:**

- `frontend/src/components/PageHeader/PageHeader.tsx` — `<h1>` + optional subtitle, status, actions slot
- `frontend/src/components/PageHeader/PageHeader.css` — BEM styles via design tokens, mobile responsive at 375px
- `frontend/src/components/PageHeader/PageHeader.test.tsx` — 7 tests (title, subtitle, actions, status presence/absence)
- `frontend/src/components/SectionHeading/SectionHeading.tsx` — `<h2>` + optional supporting text
- `frontend/src/components/SectionHeading/SectionHeading.css` — BEM styles via design tokens
- `frontend/src/components/SectionHeading/SectionHeading.test.tsx` — 3 tests (heading, supporting text, absent supporting text)

**Files modified:**

- `frontend/src/styles/tokens.css` — added `--page-header-title-size` and `--section-heading-size` aliases
- `frontend/src/components/AppShell/AppShell.tsx` — replaced `<h2 className="app-shell__page-title">` with `<PageHeader title={…} />`
- `frontend/src/components/AppShell/AppShell.css` — removed unused `.app-shell__page-title` rule
- `frontend/src/components/CraMonthSelector/CraMonthSelector.tsx` — replaced bare `<h2>` with `<SectionHeading title={periodLabel} />`
- `frontend/src/components/CraSummaryPanel/CraSummaryPanel.tsx` — replaced `<h2 className="cra-summary-panel__title">` with `<SectionHeading>`
- `frontend/src/components/CraSummaryPanel/CraSummaryPanel.css` — removed unused `.cra-summary-panel__title` rule
- `frontend/src/components/CalendarGrid/CalendarGrid.tsx` — replaced `<h2 className="calendar-header">` with `<SectionHeading>`
- `frontend/src/components/CalendarGrid/CalendarGrid.css` — removed unused `.calendar-header` rule
