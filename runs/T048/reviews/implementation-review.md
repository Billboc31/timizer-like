I have enough information to write the full review.

---

# Review — T048: Modernize page titles, section headings, and content hierarchy

## Summary

The implementation introduces two focused components (`PageHeader` and `SectionHeading`), applies them across all existing views via AppShell and four updated child components, and removes all bare heading tags. Scope is well-controlled and the plan is faithfully followed, with one deliberate deviation that improves correctness.

---

## Acceptance Criteria Check

| Criterion | Status | Notes |
|---|---|---|
| All pages use a shared page-header pattern | ✅ | AppShell wraps all views with `<PageHeader>` |
| Heading levels semantically correct and visually consistent | ✅ | h1 from PageHeader, h2 from SectionHeading, no bare tags remain |
| Main titles, subtitles, statuses, and actions have clear hierarchy | ✅ | All optional slots implemented and tested |
| Spacing above/below headings is consistent | ✅ | Driven by `--space-6` / `--space-4` tokens, no inline styles |
| No page relies on plain unstyled text as primary title | ✅ | Grep confirms zero bare `<h1>` / `<h2>` in TSX |
| Mobile layouts preserve title readability and action access | ✅ | `@media (max-width: 375px)` breakpoint with `flex-wrap` and reduced font size |
| Heading and page-header components have focused tests where behaviour exists | ✅ | 7 tests for PageHeader, 3 for SectionHeading — all behavioral |

---

## Code Quality

**PageHeader** (`PageHeader.tsx:1-22`) — clean, minimal interface with four props, renders `<header>/<h1>` with BEM classes. Optional props guard with simple conditionals. No over-engineering.

**SectionHeading** (`SectionHeading.tsx:1-15`) — equally minimal. Exactly matches the plan spec.

**AppShell** (`AppShell.tsx:11-14`) — `PAGE_TITLES` constant is the right pattern for mapping view state to human-readable titles. Avoids prop-drilling and keeps AppShell as the single source for page-level titles.

**CSS** — all spacing via design tokens (`--space-*`, `--font-size-*`), new semantic aliases `--page-header-title-size` and `--section-heading-size` added to `tokens.css:120-122`. The BEM naming is consistent with the existing codebase.

---

## Plan Deviation — CraHistory

The plan specified wrapping `CraHistory` with `<PageHeader title="Historique" />`. The coder correctly did not do this. AppShell already injects `<PageHeader title="CRA History" />` before rendering children, so adding another PageHeader inside CraHistory would produce a **duplicate h1**, which is a WCAG-level accessibility violation. The deviation improves correctness. No action needed.

---

## Minor Observations (non-blocking)

**Duplicate h2 label in selector view.** When the "New CRA" view is active, `CraMonthSelector` and `CalendarGrid` both render a `<SectionHeading>` with the same period string (e.g., "July 2026"). These are legitimately different sections (the period picker vs. the calendar grid), so two h2s with equal text is defensible. Not a blocker, but worth a note if a screen-reader audit is planned.

**French string in English UI.** `CraSummaryPanel` uses `<SectionHeading title="Compte Rendu d'Activité" />` — pre-existing behavior inherited from the component, not introduced by this ticket. Out of scope here.

**Test omission check.** The plan lists "renders title, renders subtitle when provided, renders actions slot when provided, renders status badge when provided" as the minimum test list for PageHeader. The implementation also adds four negative-case tests (omit-when-not-provided). This exceeds the plan requirement — good.

---

## Verdict

No blocking issues. Implementation is correct, minimal, and stays within scope. All acceptance criteria satisfied.

IMPLEMENTATION_APPROVED
