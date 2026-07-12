Fix applied. `App.tsx` now matches exactly the corrected version from the review.

**Changes made:**
- `frontend/src/App.tsx` — removed `import { CalendarGrid }` and `<CalendarGrid …/>` JSX (lines 4 and 29 of the previous version)

**Result:** The file compiles cleanly — only `CraSummaryPanel` is rendered, which is in scope for T022. `CalendarGrid` will be wired in when its own ticket is implemented.
