I now have all the information needed. Here is the complete test report.

---

## Test Report — T056: CRA History Detail View

**Test run:** 2026-07-28  
**Branch:** `ticket/T056-add-a-detailed-cra-history-view-with-explicit-cove`  
**Frontend test result:** 146 tests, 16 files — **all pass**

---

### Acceptance Criteria

#### AC1 — Each history entry opens a dedicated CRA detail view
**PASS**  
`CraHistory` emits `onOpenDetail(summary)` when "Open" is clicked. `App.tsx` handles it by setting `historyDetailId` and `view='history-detail'`, which renders `<CraHistoryDetail>`. Two integration tests in `App.test.tsx` ("D2: history-detail navigation") verify the transition and the back navigation.

---

#### AC2 — The exact start and end dates of the covered period are prominently displayed
**PASS**  
`coveredPeriod(month, year)` computes the first and last day using `new Date(year, month, 0)` and formats them with `Intl.DateTimeFormat('fr-FR')`, producing e.g. `"1 juillet 2026 – 31 juillet 2026"`. This is rendered in a `<p className="cra-detail__period">` below the `<h1>` title. Five unit tests cover July, January, December, and both February variants (leap/non-leap).

---

#### AC3 — Provider, client, contact, total, status, validation, and signature information are visible
**PARTIAL — backend DTO gap**  
The frontend renders all 10 metadata fields: provider name/company, client name/company, client contact name, total worked days, status badge, validation date, provider signature date, and client signature date. These are all tested and render correctly against mock data.

**However:** The backend `CraDetailsDto.java` (line 6–22) is missing three fields that the frontend expects:
- `clientContactFirstName`
- `clientContactLastName`  
- `clientSignatureDate`

These fields exist in the frontend TypeScript type (`src/api/types.ts:26`) but are absent from the Java record. In production, client contact and client signature will always display `"—"` regardless of actual data.

---

#### AC4 — All days in the covered month and their values are shown read-only
**PASS**  
`CalendarGrid` is rendered with `onDayClick={() => undefined}`. The test "weekday cells in DRAFT CRA have role='button' but clicking does not mutate the CRA" verifies that clicking a day cell never calls `updateDay`.

---

#### AC5 — The PDF download action is available when applicable
**PASS (frontend) / BLOCKED (backend)**  
The download button is shown only for `VALIDATED` CRAs (`cra?.status === 'VALIDATED'`). Download is hidden for DRAFT — both states are tested. The backend `GET /api/cras/{craId}/pdf` endpoint exists (`CraPdfDownloadController.java`).

The action is functionally correct, but depends on AC6 being resolved first (requires `GET /api/cras/{id}` to load the CRA).

---

#### AC6 — Historical values come from the CRA snapshot rather than current settings
**BLOCKED — backend endpoint missing**  
The frontend's `getCra(id)` calls `GET /api/cras/{id}`, which the frontend code itself acknowledges: `// NOTE: backend endpoint GET /api/cras/:id is pending implementation`.

No controller in the backend handles `GET /api/cras/{id}`. `CraHistoryController.java` only implements `GET /api/cras` (list). There is no service, mapper, or controller for fetching a single CRA's details.

This is the most critical blocking issue. The detail view cannot function end-to-end.

Additionally, whether the returned data constitutes a "snapshot" vs. current settings depends on the backend domain model (`MonthlyCraReport`), which was not verified as having provider/client snapshot fields frozen at validation time. This cannot be validated until the endpoint exists.

---

#### AC7 — Loading, missing, and error states are handled
**PASS**  
- **Loading:** `LoadingSkeleton` renders with `role="status"` and `aria-label="Chargement du CRA"`.
- **Missing (`craId === null`):** Shows "Aucun CRA sélectionné." — tested.
- **Error:** `role="alert"` error banner with a "Réessayer" retry button — tested (including successful retry).
- Three axe accessibility tests (`CraHistoryDetail.axe.test.tsx`) confirm no violations in all three states.

---

#### AC8 — Desktop, mobile, component, and integration tests cover the detail view
**PASS**  
- **Component tests:** 19 tests in `CraHistoryDetail.test.tsx`
- **Accessibility tests:** 3 tests in `CraHistoryDetail.axe.test.tsx`
- **Viewport tests:** Mobile (375 px) and desktop (1280 px) — both in `CraHistoryDetail.test.tsx` (`CraHistoryDetail — viewport` suite)
- **Integration tests:** 2 tests in `App.test.tsx` suite "D2: history-detail navigation"

---

### Summary

| Criterion | Status |
|-----------|--------|
| AC1 — Detail view navigation | PASS |
| AC2 — Covered period displayed | PASS |
| AC3 — All metadata fields visible | PARTIAL |
| AC4 — Read-only calendar grid | PASS |
| AC5 — PDF download conditional | PASS |
| AC6 — Data from CRA snapshot | **BLOCKED** |
| AC7 — Loading/missing/error states | PASS |
| AC8 — Test coverage | PASS |

### Blocking Issues

1. **`GET /api/cras/{id}` does not exist in the backend.** The feature cannot load a CRA detail at runtime. This blocks AC5 and AC6 entirely.

2. **Backend `CraDetailsDto` is missing `clientContactFirstName`, `clientContactLastName`, `clientSignatureDate`.** Once the endpoint is implemented, these three fields will silently return `null` and always display as `"—"`, violating AC3.

**Verdict: FAIL** — the frontend implementation is complete and well-tested, but the feature is unshippable without the two backend gaps resolved.
