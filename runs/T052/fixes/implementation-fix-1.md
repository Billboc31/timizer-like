# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T052/reviews/implementation-review.md
- generated at: 2026-07-28T10:43:39Z

---

I have all the information needed. Let me now write the formal review.

---

## T052 — CRA Signature Workflow: Implementation Review

### Scope Compliance

The implementation respects the ticket scope. Out-of-scope items (email delivery, client signature page, PDF content changes, qualified electronic signature) are absent. The old `CraValidationController` and `CraValidationService` are removed. Enum backward compatibility for `VALIDATED` rows is handled in the mapper, not via a DB migration — consistent with the plan.

---

### Correctness vs. Acceptance Criteria

| Criterion | Status |
|---|---|
| `ValidationStatus` contains all 5 new values | ✅ |
| `POST /submit` returns 200 with `READY_FOR_PROVIDER_SIGNATURE` | ✅ |
| `POST /sign-provider` returns 200 with `SIGNED_BY_PROVIDER` + date | ✅ |
| `POST /send-to-client` returns 200 with `AWAITING_CLIENT_SIGNATURE` | ✅ |
| Invalid transition → 409 `invalid_cra_transition` | ✅ |
| Duplicate transition → 409 `duplicate_cra_transition` | ✅ |
| `PATCH /days/{date}` returns 409 for non-DRAFT | ✅ |
| PDF returns 422 for DRAFT / READY_FOR_PROVIDER_SIGNATURE | ✅ |
| PDF returns 200 for SIGNED_BY_PROVIDER | ✅ |
| Existing VALIDATED rows appear as FULLY_SIGNED via mapper | ✅ |
| `CraSignatureStatus` renders distinct label/color per status | ✅ |
| `CraSignatureActions` shows correct button per status | ✅ |
| Unit tests cover all allowed and rejected transitions | ✅ |
| Integration test completes full DRAFT → AWAITING_CLIENT_SIGNATURE | ✅ |
| **Status clearly displayed in history** | ❌ |

---

### Blocking Issue

**`CraHistoryService.java:37-39` — History status always wrong for new workflow statuses**

```java
// Current (broken):
CraStatus status = report.getStatus() == ValidationStatus.VALIDATED
        ? CraStatus.VALIDATED
        : CraStatus.DRAFT;
```

This ternary predates the ticket and was never updated. Any CRA in `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, or `FULLY_SIGNED` state is emitted as `DRAFT` by `GET /api/cras`. The frontend `CraHistory.tsx` handles all six statuses correctly — but it never receives the right values because the backend silently downgrades them.

This directly violates the acceptance criterion: _"The current status is clearly displayed in the CRA interface and history."_

**Required fix** — one line change:

```java
// Fixed:
CraStatus status = CraDetailsMapper.mapStatus(report.getStatus());
```

The `mapStatus` utility already exists in `CraDetailsMapper` and handles all six enum values correctly (including the `VALIDATED → FULLY_SIGNED` backward-compat rule). Note that the `CraSummaryDto` constructor will need to accept `CraStatus` from the full mapping, which it already does since it takes a `CraStatus` parameter.

---

### Non-Blocking Observations

**1. `CraStatus.VALIDATED` declared but never emitted**
`CraDetailsMapper:48` maps `VALIDATED → FULLY_SIGNED`, so the frontend type `CraStatus` includes `VALIDATED` but the backend never sends it. The frontend switch statements defensively handle it — harmless, and consistent with the plan's backward-compat intent. After the fix above, `CraHistoryService` will also emit `FULLY_SIGNED` for old rows rather than `VALIDATED`.

**2. `FULLY_SIGNED` is an unreachable state for new CRAs**
No transition leads to `FULLY_SIGNED` from the new workflow — correct since the client signature page is out of scope. The enum value and mapper entry are appropriately speculative.

**3. `CraDayUpdateService` throws `CraValidatedException` for all non-DRAFT states**
The exception name is a legacy artifact ("validated" is not the only blocking state anymore). Not wrong at runtime — maps to 409 as required — but slightly misleading for future developers. Worth a follow-up rename (`CraNotEditableException`), not a blocker.

**4. Integration test stops at `AWAITING_CLIENT_SIGNATURE`**
Correct per scope. No FULLY_SIGNED transition to test.

---

### Summary

The transition service, controller, exception handler, mapper, PDF download guard, day-update guard, frontend components, and tests are all correctly implemented. One pre-existing method (`CraHistoryService.toSummary`) was not updated for the new enum values — causing all new workflow statuses to display as DRAFT in the history list. This is a clear runtime defect against an explicit acceptance criterion and must be fixed before approval.

IMPLEMENTATION_FIX_REQUIRED
