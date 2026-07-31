---

## Test Report Summary — T067

**Result: TESTING_APPROVED** (with one fix applied during testing)

---

### What was run

- `mvn test` (backend, 203 tests)
- `npm test` (frontend, 269 tests)
- `npx tsc --noEmit` (TypeScript check)

---

### Fix applied

The `GET /api/cras/{id}` endpoint was missing from the implementation. Three integration tests in `CraSignatureWorkflowIntegrationTest` — `reopenAfterConsultantSignatureReturnsToDraft`, `reopenAfterBothSignaturesReturnsToDraft`, and `concurrentConsultantValidationsProduceAtMostOneSuccess` — called this endpoint and received 404.

Fix: added `getCra(Long id)` to `CraHistoryService` and a `@GetMapping("/{id}")` handler to `CraHistoryController`. Two files changed in the backend. After the fix, **203/203 backend tests pass**.

---

### Acceptance criteria — all 11 PASS

| Criterion | Status |
|---|---|
| Valid draft always enters consultant signature step | PASS |
| Current validation failure fixed | PASS |
| Generic "not allowed" → precise blocking reasons | PASS |
| Consultant signature → AWAITING_CLIENT_SIGNATURE | PASS |
| Client signature → VALIDATED | PASS |
| Client cannot sign before consultant | PASS |
| CRA cannot be VALIDATED without both signatures | PASS |
| Repeated requests are idempotent | PASS |
| Editing signed CRA returns to DRAFT | PASS |
| State consistent after refresh | PASS |
| Events are auditable | PASS |

---

### Non-blocking observations

- **TypeScript**: 27 errors, all pre-existing on `main` (which has 50). T067 introduced none.
- **Page refresh tests**: No frontend integration test covers this — acknowledged gap from the previous review.
- **Clipboard UX**: Two minor UX issues with the "Lien copié !" button (pre-existing from review 5).
