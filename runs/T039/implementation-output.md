All 16 tests pass. The `Not implemented: navigation` warning is from jsdom handling the anchor-click download trigger — it's expected and harmless.

Here's a summary of what was implemented:

**Files modified:**

- **`CraHistory.tsx`** — Replaced table with `<ul role="list">` of cards. Each card shows period, status badge, worked days, validation date, Open button (always), and Download PDF button (VALIDATED only). Sort newest-first. Added `LoadingSkeleton` component (3 shimmer cards), styled error banner with `role="alert"`, and empty state. All buttons have `aria-label` including the period name.

- **`CraHistory.css`** — Full rewrite: flex-row card layout wrapping to column on mobile (≤640px), pill-shaped status badges (amber for DRAFT, green for VALIDATED), shimmer skeleton animation, centered empty state, red error banner. All touch targets ≥44px. No horizontal overflow at any viewport width.

- **`CraHistory.test.tsx`** — Updated loading test to query by `role="list"` + aria-name. Added 6 new tests: VALIDATED/DRAFT badge class, newest-first sort order, `aria-label` on Open and Download buttons. All 16 tests pass.
