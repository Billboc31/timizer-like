# Test Report — T037: Add robust loading, empty, success, and error states

## Verdict: PASS

All 7 acceptance criteria met. 79/79 Vitest tests pass.

---

## Acceptance Criteria

### AC1 — Every API-driven screen has a visible loading state
**PASS**

| Screen | Loading state |
|---|---|
| CraMonthSelector | `<p>Loading...</p>` while listCras is in flight |
| CraHistory | `<p className="cra-history__status">Loading...</p>` |
| CalendarGrid (via App.tsx) | `<div className="calendar-loading">Loading...</div>` |

Covered by tests: `renders loading indicator while fetching` (CraMonthSelector, CraHistory, CalendarGrid).

---

### AC2 — Empty CRA history and missing CRA states have dedicated messages and actions
**PASS**

- `CraHistory`: renders `"No CRA records found."` when list is empty.
- `CalendarGrid`: renders `"No CRA data available."` when `cra` prop is `null`.

Covered by tests: `renders empty state when no CRAs exist`, `renders an empty state when cra is null and not loading`.

---

### AC3 — Save, validation, and PDF actions show progress and disable duplicate clicks
**PASS**

| Action | Disabled condition | Progress indicator |
|---|---|---|
| Create CRA button | `creating \|\| !!successMessage` | "Creating..." text |
| Validate Confirmer/Annuler buttons | `uiState === 'loading'` | Button text "Validation…" |
| Download PDF + Open buttons | `downloading === cra.id` | Button text "Downloading..." |
| Day cell button | `day === updatingDay` | Cell text "…", class `day-cell--updating` |

Covered by tests: `disables confirmer and annuler while request is in-flight`, `disables Open and Download PDF buttons while PDF is downloading`, `disables the cell and shows updating indicator for updatingDay`, success message button disabled test.

---

### AC4 — Successful actions provide clear confirmation
**PASS** (with minor note)

| Action | Confirmation |
|---|---|
| Create CRA | `"CRA créé avec succès."` (`role="status"`) shown for 3 s before navigation |
| Validate CRA | `"CRA validé avec succès."` (`role="status"`) shown for 2 s before `onValidated` callback |
| Day update | Cell value updates visually with returned DTO (no explicit message) |
| PDF download | File downloads automatically (no explicit message) |

Day updates and PDF downloads have no explicit success toast — this matches the plan scope. The plan specified success messages only for create and validate actions.

Covered by tests: `shows success message then calls onOpen after create`, `shows success message then calls onValidated after delay`.

---

### AC5 — API and network failures display user-friendly messages
**PASS**

`errorMessages.ts` maps every `ApiErrorCode` to a French user-readable string:

| Code | Message |
|---|---|
| `invalid_work_value` | "La valeur saisie n'est pas valide." |
| `cra_validated` | "Ce CRA est déjà validé et ne peut plus être modifié." |
| `cra_not_found` | "Ce CRA est introuvable." |
| `cra_day_not_found` | "Ce jour n'existe pas dans ce CRA." |
| `network_error` | "Impossible de contacter le serveur. Vérifiez votre connexion." |
| `unknown_error` / non-ApiError | "Une erreur est survenue. Veuillez réessayer." |

All components use `getErrorMessage()`. No raw stack traces, HTTP status codes, or JSON payloads are rendered.

Covered by tests: 8 tests in `errorMessages.test.ts` covering all codes + fallback.

---

### AC6 — Retrying a failed operation is possible where relevant
**PASS**

| Failure context | Retry mechanism |
|---|---|
| CraMonthSelector list load error | "Réessayer" button re-calls `loadCras()` |
| CraHistory list load error | "Réessayer" button re-calls `loadCras()` |
| CalendarGrid / CRA detail load error | "Réessayer" button calls `onRetry` prop (wired in App.tsx to `() => loadCra(lastCraId)`) |

Covered by tests: `retries list load when Réessayer is clicked` (CraMonthSelector, CraHistory), `shows retry button when error and onRetry provided` (CalendarGrid).

---

### AC7 — No uncaught promise rejection appears in the browser console during tested flows
**PASS**

All async operations have explicit `.catch()` or `try/catch` handlers:
- `loadCras()` in both selectors
- `getCra()` in `App.loadCra()`
- `updateDay()` in `App.handleDayChange()`
- `validateCra()` in `CraValidation.handleConfirm()` (async/await + try/catch)
- `downloadCraPdf()` in `CraHistory.handleDownloadPdf()` (`.catch()` + `.finally()`)

The jsdom `"Not implemented: navigation"` warning appearing in the test run is an expected JSDOM limitation from `a.click()` during the PDF download test — it is not an uncaught promise rejection and does not fail any test.

---

## Regressions Observed

None. All 79 pre-existing tests continue to pass after the changes.

```
Test Files  7 passed (7)
Tests      79 passed (79)
Duration   ~590ms
```

---

## Pre-existing Issues (not caused by T037)

- **TypeScript error in `src/api/httpClient.ts`** (`process` is not defined for browser TypeScript): pre-dates this ticket (last modified in T018 commit `be9c0f8c`). Unrelated to T037 changes.

---

## Minor Quality Notes (non-blocking)

- `validatedDto` state in `CraValidation.tsx` is set (`setValidatedDto(updated)`) but never read — the `setTimeout` closure captures `updated` directly. Dead code, but not a bug.
- No legacy imports from `src/api/cra.ts` remain in any component (verified by grep). The file is preserved as specified in the plan.
