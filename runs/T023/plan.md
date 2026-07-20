The plan is written to `runs/T023/plan.md`. Here's a summary of what it specifies:

**3 files touched:**
- `App.tsx` — add `openCra` state, switch between `<CraMonthSelector>` and `<CraPage>`
- `CraPage/CraPage.tsx` (new) — fetches full CRA details, renders CalendarGrid + status badge + validate button + inline confirmation + error display
- `CraPage/CraPage.test.tsx` (new) — 9 Vitest tests covering the full validation flow

**Key decisions documented in the plan:**
- No external modal library (consistent with the codebase's zero-dependency UI approach)
- `providerSignatureDate` is auto-set to today's ISO date (flagged as an assumption since the API requires it but the client signature UI is out of scope)
- `CalendarGrid` needs no changes — it has no edit interactions to lock
