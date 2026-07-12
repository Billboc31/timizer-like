The plan has been written to `runs/T019/plan.md`. Here is the content:

---

## Objective

Add a `CraMonthSelector` React component that lets the user pick a month and year, then open an existing CRA or create a new one for that period. The component is integrated into `App.jsx` and replaces the current placeholder content.

## Included

**`frontend/src/components/CraMonthSelector.tsx`** — new component:
- Props: `onOpen: (cra: CraSummaryDto) => void`
- Internal state: `selectedMonth` (1–12, default current month), `selectedYear` (≥ 2000, default current year), `cras: CraSummaryDto[]`, `loading: boolean`, `error: string | null`
- On mount: call `listCras()`, store results; display loading indicator while pending, error message on failure
- Derive `existingCra`: find in `cras` where `month === selectedMonth && year === selectedYear`
- UI controls: `<select>` for month (January–December, values 1–12), `<input type="number">` for year
- Display selected period as a formatted label (e.g. "July 2026")
- Primary action button: "Open CRA" if a CRA exists for the period, "Create CRA" if not
- During create: disable button + inline loading; on error show message and re-enable

**`frontend/src/App.jsx`** — updated to render `<CraMonthSelector>` in place of the placeholder

**`frontend/src/components/__tests__/CraMonthSelector.test.tsx`** — Vitest tests covering loading, error, open, and create flows

## Excluded

- Calendar day grid, CRA history page, PDF download, backend changes, client signature
- Routing/navigation (deferred; `onOpen` is the extension point)
- Accessibility audit, year upper-bound constraint

## Acceptance criteria

- Month selector and year input render correctly
- Loading state shown while `listCras()` is pending
- Error state shown when `listCras()` fails
- "Open CRA" button when period exists → calls `onOpen(cra)`
- "Create CRA" button when period missing → calls `createCra(year, month)` then `onOpen(result)`
- Create error → inline message + button re-enabled
- `App.jsx` renders the component instead of the placeholder
- `npm test` passes
