---

## Test Report — T037

**Verdict: PASS**

All 7 acceptance criteria are met. 79/79 Vitest/RTL tests pass.

---

### AC1 — Every API-driven screen has a visible loading state
**PASS** — CraMonthSelector, CraHistory, and CalendarGrid (via App.tsx) all render dedicated loading UI while their requests are in flight.

### AC2 — Empty CRA history and missing CRA states have dedicated messages
**PASS** — CraHistory shows "No CRA records found."; CalendarGrid shows "No CRA data available." when no CRA is open.

### AC3 — Save, validation, and PDF actions show progress and disable duplicate clicks
**PASS** — Create button disabled during `creating || successMessage`; Confirmer/Annuler disabled during `loading`; PDF Open+Download buttons disabled per row during download; day cell buttons disabled with "…" indicator while updating.

### AC4 — Successful actions provide clear confirmation
**PASS** — "CRA créé avec succès." shown for 3 s after create; "CRA validé avec succès." shown for 2 s after validate. Day updates reflect visually (no explicit success toast — aligns with plan scope).

### AC5 — API and network failures display user-friendly messages
**PASS** — `getErrorMessage()` maps all 6 `ApiErrorCode` values to French user-readable strings. No raw stack traces or HTTP payloads are rendered anywhere.

### AC6 — Retrying a failed operation is possible where relevant
**PASS** — "Réessayer" button on list-load errors in both CraMonthSelector and CraHistory; CalendarGrid shows retry button on CRA detail load error (wired through App.tsx).

### AC7 — No uncaught promise rejection in tested flows
**PASS** — All async paths have `.catch()` or `try/catch`. The jsdom `"Not implemented: navigation"` warning is an expected JSDOM limitation from `a.click()` in the PDF test — not an uncaught rejection.

---

**Regressions:** None.

**Pre-existing issue (not T037):** TypeScript errors in `httpClient.ts` re: `process.env` — unchanged since T018.

**Minor dead code:** `validatedDto` state in `CraValidation.tsx` is set but never read (the setTimeout closure captures `updated` directly). Not a bug.
