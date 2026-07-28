## Objective

Introduce a shared `PageHeader` and `SectionHeading` component pair, apply them across every existing view, and fix the semantic heading hierarchy (no current `<h1>` exists). The result is a consistent, polished title and heading system with focused component tests.

## Included

### New components

- `frontend/src/components/PageHeader/PageHeader.tsx` — renders an `<h1>`, optional subtitle (`<p>`), optional status badge (`<span>`), and an optional `actions` slot (JSX). Uses BEM class `.page-header` with variants.
- `frontend/src/components/PageHeader/PageHeader.css` — styles using existing design tokens (`--font-size-*`, `--color-*`, `--space-*`). Layout: flex row for title+actions, column for title+subtitle.
- `frontend/src/components/PageHeader/PageHeader.test.tsx` — tests: renders title, renders subtitle when provided, renders actions slot when provided, renders status badge when provided.

- `frontend/src/components/SectionHeading/SectionHeading.tsx` — renders an `<h2>` with optional supporting text (`<p>`). Props: `title`, `supportingText?`.
- `frontend/src/components/SectionHeading/SectionHeading.css` — consistent spacing and typography via tokens.
- `frontend/src/components/SectionHeading/SectionHeading.test.tsx` — tests: renders heading text, renders supporting text when provided, omits supporting text element when absent.

### Existing components updated

- `AppShell.tsx` / `AppShell.css` — replace the `<h2 className="app-shell__page-title">` with `<PageHeader title={…} />`. Remove the now-unused CSS rule.
- `CraMonthSelector.tsx` / `CraMonthSelector.css` — replace the bare `<h2>` period label with `<SectionHeading title={…} />`.
- `CraHistory.tsx` / `CraHistory.css` — replace or wrap any inline heading with `<PageHeader title="Historique" />` at view level; section sub-headings (if any) use `<SectionHeading>`.
- `CraSummaryPanel.tsx` / `CraSummaryPanel.css` — replace `<h2 className="cra-summary-panel__title">` with `<SectionHeading title={…} />`. Remove the now-unused CSS rule.
- `CalendarGrid.tsx` / `CalendarGrid.css` — replace `<h2 className="calendar-header">` with `<SectionHeading title={…} />`. Remove the now-unused CSS rule.

### Design token additions (if gaps are found)

- `frontend/src/styles/tokens.css` — add `--page-header-title-size`, `--section-heading-size` aliases if needed to avoid magic values in component CSS.

### Hypothesis

The ticket mentions "settings" and "signature" views that do not exist in the current frontend. The plan covers only the views that exist. Those future views will adopt the shared components when they are built.

## Excluded

- Creating settings or signature pages.
- Changing navigation structure or routing.
- Modifying backend error messages.
- Adding new business features.
- Restyling non-heading content (cards, buttons, form fields).
- Changing the overall AppShell layout or navigation bar.
- Dark mode or theme variants.

## Acceptance criteria

- `PageHeader` renders an `<h1>` for page-level titles; no existing component renders a bare `<h1>` outside of it.
- `SectionHeading` renders an `<h2>`; no existing component renders a bare `<h2>` heading outside of it.
- Every view (CRA selector, CRA history, summary panel, calendar grid) uses `PageHeader` or `SectionHeading` — no plain unstyled heading tags remain as primary titles.
- The optional subtitle, status badge, and actions slot of `PageHeader` render only when the prop is provided.
- Spacing above and below `PageHeader` and `SectionHeading` is driven by the shared CSS, not inline styles.
- All new component tests pass (`vitest run` green).
- No pre-existing test is broken by the changes.
- On a 375 px viewport the page title and any action button remain readable and accessible (visually verified or snapshot-tested).
