# Conflict Context — T052

Generated at: 2026-07-28T15:30:34Z

## Metadata

- pre_conflict_state: TEST_COMPLETE
- conflict_detected_at: 2026-07-28T10:55:38Z
- conflict_pr_number: 110
- conflicted_files (source): backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java, backend/src/test/java/com/timizerlike/backend/cra/web/CraValidationControllerTest.java, backend/src/test/java/com/timizerlike/cra/service/CraPdfDownloadServiceTest.java, frontend/src/App.tsx, frontend/src/api/__tests__/craClient.test.ts, frontend/src/api/craClient.ts, frontend/src/components/CraHistory/CraHistory.css, frontend/src/components/CraSummaryPanel/CraSummaryPanel.tsx, frontend/src/components/CraValidation/CraValidation.axe.test.tsx, frontend/src/components/CraValidation/CraValidation.css, frontend/src/components/CraValidation/CraValidation.test.tsx
- skipped_runtime_noise: 0 path(s)

---

## Ticket

# T052 — Add CRA signature workflow and signature status tracking

**Source**: GitHub Issue #97

## Description

## Context
A CRA now needs a clear lifecycle covering preparation, provider signature, client signature, and final completion.

## Goal
Introduce explicit signature states and enforce valid transitions throughout the application.

## Description
Extend the CRA model and APIs with a signature workflow such as draft, ready for provider signature, provider signed, awaiting client signature, and fully signed. Define which fields remain editable at each stage and which actions are available.

The frontend must display the current signature status prominently and present only valid next actions. Invalid or repeated signature operations must be rejected by the backend with a clear business error.

## Out of Scope
- Email delivery.
- Implementing the client signature page itself.
- Qualified electronic signature certification.

## Acceptance Criteria
- [ ] CRA signature statuses are explicitly represented in the domain model.
- [ ] Valid status transitions are documented and enforced server-side.
- [ ] The current status is clearly displayed in the CRA interface and history.
- [ ] Editing rules are enforced consistently after provider or client signature.
- [ ] Invalid and duplicate transitions return a clear error.
- [ ] Existing validated CRAs are migrated or mapped safely.
- [ ] Unit and integration tests cover every allowed and rejected transition.

---

## Plan

## Objective

Introduce an explicit multi-step CRA signature workflow (DRAFT → READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE) with enforced transitions, per-state editing rules, and a frontend that displays the current status prominently and offers only valid next actions. Existing VALIDATED records are remapped to FULLY_SIGNED without a database migration.

## Included

### Backend — domain model

**`ValidationStatus.java`**
- Add: `READY_FOR_PROVIDER_SIGNATURE`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`
- Keep: `DRAFT`, `SIGNED_BY_PROVIDER` (already present, unused), `VALIDATED` (legacy — never written by new code, kept for existing DB rows)

**`CraStatus.java`** (DTO-layer enum, located in `dto/` package)
- Add: `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`
- Keep: `DRAFT`, `VALIDATED` (retained in frontend type as well for safety)

**`CraDetailsMapper.java`**
- Map each `ValidationStatus` value to its `CraStatus` counterpart
- `VALIDATED` → `FULLY_SIGNED` (backward-compat rule for existing rows)

### Backend — transition service

**`CraSignatureTransitionService.java`** (new service)
- Declare allowed transitions as a constant map: `DRAFT → READY_FOR_PROVIDER_SIGNATURE`, `READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER`, `SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE`
- `submit(Long craId)` — DRAFT → READY_FOR_PROVIDER_SIGNATURE
- `signByProvider(Long craId, LocalDate providerSignatureDate)` — READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER; sets `providerSignatureDate` on entity
- `sendToClient(Long craId)` — SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE
- Throw `InvalidCraTransitionException` when source state is not allowed for the requested action
- Throw `DuplicateCraTransitionException` when CRA is already in the target state

**`InvalidCraTransitionException.java`** / **`DuplicateCraTransitionException.java`** (new exceptions)

### Backend — API

**`CraSignatureController.java`** (new controller, replaces `CraValidationController`)
- `POST /api/cras/{craId}/submit` → delegates to `submit()`, returns `CraDetailsDto` (200)
- `POST /api/cras/{craId}/sign-provider` body `{ "providerSignatureDate": "YYYY-MM-DD" }` → delegates to `signByProvider()`, returns `CraDetailsDto` (200)
- `POST /api/cras/{craId}/send-to-client` → delegates to `sendToClient()`, returns `CraDetailsDto` (200)

**`CraApiExceptionHandler.java`**
- `InvalidCraTransitionException` → HTTP 409, error code `invalid_cra_transition`
- `DuplicateCraTransitionException` → HTTP 409, error code `duplicate_cra_transition`

**`CraDayUpdateService.java`**
- Replace the current `status != DRAFT` check with an explicit guard covering all non-DRAFT statuses (VALIDATED included)
- No logic change, just make the lock condition robust against the new enum values

**`CraPdfDownloadService.java`**
- Allow PDF for: `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED` (legacy)
- Reject PDF for: `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE` (return `CraNotValidatedException`)

**`CraValidationController.java`** / **`CraValidationService.java`**
- Remove both (no callers once frontend is updated and integration tests are rewritten)

### Backend — tests

**`CraSignatureTransitionServiceTest.java`** (new unit test)
- Happy path for each of the three transitions
- `signByProvider` sets `providerSignatureDate` correctly
- `InvalidCraTransitionException` thrown for every forbidden source state (e.g., DRAFT → SIGNED_BY_PROVIDER)
- `DuplicateCraTransitionException` thrown when already in target state

**`CraSignatureWorkflowIntegrationTest.java`** (new integration test, replaces `CraWorkflowIntegrationTest.java`)
- Full DRAFT → READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE over HTTP
- Verify HTTP 200 and status field at each step
- Verify PDF download rejected for DRAFT and READY_FOR_PROVIDER_SIGNATURE (422)
- Verify PDF download accepted for SIGNED_BY_PROVIDER (200)
- Verify day-entry update rejected (409) for any non-DRAFT CRA
- Verify invalid transition (DRAFT → SIGNED_BY_PROVIDER) returns 409 `invalid_cra_transition`
- Verify repeated transition returns 409 `duplicate_cra_transition`

### Frontend — types and API client

**`api/types.ts`**
- `CraStatus`: extend to `'DRAFT' | 'READY_FOR_PROVIDER_SIGNATURE' | 'SIGNED_BY_PROVIDER' | 'AWAITING_CLIENT_SIGNATURE' | 'FULLY_SIGNED' | 'VALIDATED'`

**`api/craClient.ts`**
- Add `submitCra(craId: number): Promise<CraDetailsDto>`
- Add `signCraByProvider(craId: number, body: { providerSignatureDate: string }): Promise<CraDetailsDto>`
- Add `sendCraToClient(craId: number): Promise<CraDetailsDto>`
- Remove `validateCra` (or keep as deprecated if the old endpoint is kept for transition period)

### Frontend — components

**`components/CraSignatureStatus/CraSignatureStatus.tsx`** (new)
- Renders a color-coded badge + description label per status:
  - DRAFT → grey, "Brouillon"
  - READY_FOR_PROVIDER_SIGNATURE → blue, "En attente de signature prestataire"
  - SIGNED_BY_PROVIDER → amber, "Signé par le prestataire"
  - AWAITING_CLIENT_SIGNATURE → yellow, "En attente de signature client"
  - FULLY_SIGNED / VALIDATED → green, "Signé"
- Placed prominently in `CraSummaryPanel`

**`components/CraSignatureActions/CraSignatureActions.tsx`** (new, replaces `CraValidation`)
- DRAFT → "Soumettre pour signature" button → calls `submitCra`
- READY_FOR_PROVIDER_SIGNATURE → "Signer (prestataire)" button + date input → calls `signCraByProvider`
- SIGNED_BY_PROVIDER → "Envoyer au client" button → calls `sendCraToClient`
- AWAITING_CLIENT_SIGNATURE, FULLY_SIGNED, VALIDATED → no action button
- On success: calls `onSuccess(updatedCra)` callback to refresh parent state
- On error: displays inline error message from API response

**`components/CraSummaryPanel/CraSummaryPanel.tsx`**
- Replace the existing status badge with `<CraSignatureStatus status={cra.status} />`
- Add `<CraSignatureActions cra={cra} onSuccess={...} />` below

**`components/CraHistory/CraHistory.tsx`**
- Update status badge rendering to handle all new `CraStatus` values with matching labels and colors

**`components/CraValidation/CraValidation.tsx`**
- Remove (functionality moved to `CraSignatureActions`)

### Frontend — tests

**`components/CraSignatureStatus/CraSignatureStatus.test.tsx`** (new)
- Renders correct label and CSS class/color for each of the six status values

**`components/CraSignatureActions/CraSignatureActions.test.tsx`** (new)
- Shows "Soumettre" button only for DRAFT
- Shows "Signer" button + date input only for READY_FOR_PROVIDER_SIGNATURE
- Shows "Envoyer" button only for SIGNED_BY_PROVIDER
- Shows nothing for AWAITING_CLIENT_SIGNATURE and FULLY_SIGNED
- Calls correct API function and invokes `onSuccess` on 200
- Displays error message on API failure

**`api/__tests__/craClient.test.ts`**
- Add tests for `submitCra`, `signCraByProvider`, `sendCraToClient`
- Remove test for `validateCra` (or update if kept)

**`components/CraHistory/CraHistory.test.tsx`**
- Add fixture rows for each new status; verify label text rendered correctly

## Excluded

- Email delivery to client
- Client signature page (the page where the client actually signs)
- Qualified electronic signature certification (DocuSign, Adobe Sign, PKI)
- Changes to PDF content or PDF generation logic
- Changes to CRA creation or day-entry default-value logic
- Database schema migration script (Hibernate `ddl-auto=update` handles new enum values; VALIDATED rows are remapped in the mapper only)
- Keeping the old `POST /api/cras/{craId}/validate` endpoint for a transition period (it is simply removed)

## Acceptance criteria

- `ValidationStatus` contains at minimum: `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`
- `POST /api/cras/{id}/submit` returns 200 with `status: READY_FOR_PROVIDER_SIGNATURE` when source is DRAFT
- `POST /api/cras/{id}/sign-provider` returns 200 with `status: SIGNED_BY_PROVIDER` and the submitted `providerSignatureDate` when source is READY_FOR_PROVIDER_SIGNATURE
- `POST /api/cras/{id}/send-to-client` returns 200 with `status: AWAITING_CLIENT_SIGNATURE` when source is SIGNED_BY_PROVIDER
- Any transition from a non-allowed source state returns HTTP 409 with `{ "error": "invalid_cra_transition" }`
- Calling a transition when already in the target state returns HTTP 409 with `{ "error": "duplicate_cra_transition" }`
- `PATCH /api/cras/{id}/days/{date}` returns 409 for any CRA that is not in DRAFT state
- PDF download returns 422 for DRAFT and READY_FOR_PROVIDER_SIGNATURE; 200 for SIGNED_BY_PROVIDER, AWAITING_CLIENT_SIGNATURE, FULLY_SIGNED
- Existing DB rows with `status = 'VALIDATED'` appear as `FULLY_SIGNED` in all API responses without any DB migration
- Frontend `CraSignatureStatus` component renders a distinct label and color for each status
- Frontend `CraSignatureActions` component shows exactly one action button for DRAFT, READY_FOR_PROVIDER_SIGNATURE, and SIGNED_BY_PROVIDER; shows no button for the remaining states
- `CraSignatureTransitionServiceTest` covers every allowed transition and every rejected transition
- `CraSignatureWorkflowIntegrationTest` completes the full DRAFT → AWAITING_CLIENT_SIGNATURE workflow over HTTP without errors

---

## PR Diff (PR #110)

```diff
diff --git a/backend/src/main/java/com/timizer/backend/cra/CraDetailsMapper.java b/backend/src/main/java/com/timizer/backend/cra/CraDetailsMapper.java
index 09f58902..0309a143 100644
--- a/backend/src/main/java/com/timizer/backend/cra/CraDetailsMapper.java
+++ b/backend/src/main/java/com/timizer/backend/cra/CraDetailsMapper.java
@@ -38,10 +38,14 @@ public static CraDetailsDto toDto(MonthlyCraReport report) {
         );
     }
 
-    private static CraStatus mapStatus(ValidationStatus status) {
-        if (status == ValidationStatus.VALIDATED) {
-            return CraStatus.VALIDATED;
-        }
-        return CraStatus.DRAFT;
+    public static CraStatus mapStatus(ValidationStatus status) {
+        return switch (status) {
+            case DRAFT -> CraStatus.DRAFT;
+            case READY_FOR_PROVIDER_SIGNATURE -> CraStatus.READY_FOR_PROVIDER_SIGNATURE;
+            case SIGNED_BY_PROVIDER -> CraStatus.SIGNED_BY_PROVIDER;
+            case AWAITING_CLIENT_SIGNATURE -> CraStatus.AWAITING_CLIENT_SIGNATURE;
+            case FULLY_SIGNED -> CraStatus.FULLY_SIGNED;
+            case VALIDATED -> CraStatus.FULLY_SIGNED;
+        };
     }
 }
diff --git a/backend/src/main/java/com/timizer/backend/cra/DuplicateCraTransitionException.java b/backend/src/main/java/com/timizer/backend/cra/DuplicateCraTransitionException.java
new file mode 100644
index 00000000..2992a986
--- /dev/null
+++ b/backend/src/main/java/com/timizer/backend/cra/DuplicateCraTransitionException.java
@@ -0,0 +1,8 @@
+package com.timizer.backend.cra;
+
+public class DuplicateCraTransitionException extends RuntimeException {
+
+    public DuplicateCraTransitionException(Long id, ValidationStatus targetState) {
+        super("CRA " + id + " is already in state " + targetState);
+    }
+}
diff --git a/backend/src/main/java/com/timizer/backend/cra/InvalidCraTransitionException.java b/backend/src/main/java/com/timizer/backend/cra/InvalidCraTransitionException.java
new file mode 100644
index 00000000..750dc108
--- /dev/null
+++ b/backend/src/main/java/com/timizer/backend/cra/InvalidCraTransitionException.java
@@ -0,0 +1,8 @@
+package com.timizer.backend.cra;
+
+public class InvalidCraTransitionException extends RuntimeException {
+
+    public InvalidCraTransitionException(Long id, ValidationStatus from, String action) {
+        super("CRA " + id + " cannot perform '" + action + "' from state " + from);
+    }
+}
diff --git a/backend/src/main/java/com/timizer/backend/cra/ValidationStatus.java b/backend/src/main/java/com/timizer/backend/cra/ValidationStatus.java
index 1d57ed9a..94452e70 100644
--- a/backend/src/main/java/com/timizer/backend/cra/ValidationStatus.java
+++ b/backend/src/main/java/com/timizer/backend/cra/ValidationStatus.java
@@ -2,6 +2,9 @@
 
 public enum ValidationStatus {
     DRAFT,
+    READY_FOR_PROVIDER_SIGNATURE,
     SIGNED_BY_PROVIDER,
+    AWAITING_CLIENT_SIGNATURE,
+    FULLY_SIGNED,
     VALIDATED
 }
diff --git a/backend/src/main/java/com/timizerlike/backend/cra/dto/CraStatus.java b/backend/src/main/java/com/timizerlike/backend/cra/dto/CraStatus.java
index 84be37cd..154b7bf2 100644
--- a/backend/src/main/java/com/timizerlike/backend/cra/dto/CraStatus.java
+++ b/backend/src/main/java/com/timizerlike/backend/cra/dto/CraStatus.java
@@ -2,5 +2,9 @@
 
 public enum CraStatus {
     DRAFT,
+    READY_FOR_PROVIDER_SIGNATURE,
+    SIGNED_BY_PROVIDER,
+    AWAITING_CLIENT_SIGNATURE,
+    FULLY_SIGNED,
     VALIDATED
 }
diff --git a/backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java b/backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java
index 13a36bfd..61296202 100644
--- a/backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java
+++ b/backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java
@@ -11,6 +11,8 @@
 import com.timizer.backend.cra.CraNotFoundException;
 import com.timizer.backend.cra.CraNotValidatedException;
 import com.timizer.backend.cra.CraValidatedException;
+import com.timizer.backend.cra.DuplicateCraTransitionException;
+import com.timizer.backend.cra.InvalidCraTransitionException;
 import com.timizer.backend.cra.InvalidWorkValueException;
 
 @RestControllerAdvice
@@ -45,4 +47,16 @@ public ResponseEntity<Map<String, String>> handleCraNotValidated() {
         return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                 .body(Map.of("error", "cra_not_validated"));
     }
+
+    @ExceptionHandler(InvalidCraTransitionException.class)
+    public ResponseEntity<Map<String, String>> handleInvalidCraTransition() {
+        return ResponseEntity.status(HttpStatus.CONFLICT)
+                .body(Map.of("error", "invalid_cra_transition"));
+    }
+
+    @ExceptionHandler(DuplicateCraTransitionException.class)
+    public ResponseEntity<Map<String, String>> handleDuplicateCraTransition() {
+        return ResponseEntity.status(HttpStatus.CONFLICT)
+                .body(Map.of("error", "duplicate_cra_transition"));
+    }
 }
diff --git a/backend/src/main/java/com/timizerlike/backend/cra/web/CraSignatureController.java b/backend/src/main/java/com/timizerlike/backend/cra/web/CraSignatureController.java
new file mode 100644
index 00000000..3057c4df
--- /dev/null
+++ b/backend/src/main/java/com/timizerlike/backend/cra/web/CraSignatureController.java
@@ -0,0 +1,39 @@
+package com.timizerlike.backend.cra.web;
+
+import jakarta.validation.Valid;
+import org.springframework.web.bind.annotation.PathVariable;
+import org.springframework.web.bind.annotation.PostMapping;
+import org.springframework.web.bind.annotation.RequestBody;
+import org.springframework.web.bind.annotation.RequestMapping;
+import org.springframework.web.bind.annotation.RestController;
+
+import com.timizerlike.backend.cra.dto.CraDetailsDto;
+import com.timizerlike.cra.service.CraSignatureTransitionService;
+
+@RestController
+@RequestMapping("/api/cras")
+public class CraSignatureController {
+
+    private final CraSignatureTransitionService transitionService;
+
+    public CraSignatureController(CraSignatureTransitionService transitionService) {
+        this.transitionService = transitionService;
+    }
+
+    @PostMapping("/{craId}/submit")
+    public CraDetailsDto submit(@PathVariable Long craId) {
+        return transitionService.submit(craId);
+    }
+
+    @PostMapping("/{craId}/sign-provider")
+    public CraDetailsDto signByProvider(
+            @PathVariable Long craId,
+            @Valid @RequestBody SignProviderRequestDto request) {
+        return transitionService.signByProvider(craId, request.providerSignatureDate());
+    }
+
+    @PostMapping("/{craId}/send-to-client")
+    public CraDetailsDto sendToClient(@PathVariable Long craId) {
+        return transitionService.sendToClient(craId);
+    }
+}
diff --git a/backend/src/main/java/com/timizerlike/backend/cra/web/CraValidationController.java b/backend/src/main/java/com/timizerlike/backend/cra/web/CraValidationController.java
deleted file mode 100644
index 44e02eea..00000000
--- a/backend/src/main/java/com/timizerlike/backend/cra/web/CraValidationController.java
+++ /dev/null
@@ -1,29 +0,0 @@
-package com.timizerlike.backend.cra.web;
-
-import jakarta.validation.Valid;
-import org.springframework.web.bind.annotation.PathVariable;
-import org.springframework.web.bind.annotation.PostMapping;
-import org.springframework.web.bind.annotation.RequestBody;
-import org.springframework.web.bind.annotation.RequestMapping;
-import org.springframework.web.bind.annotation.RestController;
-
-import com.timizerlike.backend.cra.dto.CraDetailsDto;
-import com.timizerlike.cra.service.CraValidationService;
-
-@RestController
-@RequestMapping("/api/cras/{craId}/validate")
-public class CraValidationController {
-
-    private final CraValidationService validationService;
-
-    public CraValidationController(CraValidationService validationService) {
-        this.validationService = validationService;
-    }
-
-    @PostMapping
-    public CraDetailsDto validate(
-            @PathVariable Long craId,
-            @Valid @RequestBody ValidateCraRequestDto request) {
-        return validationService.validate(craId, request.providerSignatureDate());
-    }
-}
diff --git a/backend/src/main/java/com/timizerlike/backend/cra/web/ValidateCraRequestDto.java b/backend/src/main/java/com/timizerlike/backend/cra/web/SignProviderRequestDto.java
similarity index 81%
rename from backend/src/main/java/com/timizerlike/backend/cra/web/ValidateCraRequestDto.java
rename to backend/src/main/java/com/timizerlike/backend/cra/web/SignProviderRequestDto.java
index 8d2b0e99..c065f16d 100644
--- a/backend/src/main/java/com/timizerlike/backend/cra/web/ValidateCraRequestDto.java
+++ b/backend/src/main/java/com/timizerlike/backend/cra/web/SignProviderRequestDto.java
@@ -3,7 +3,7 @@
 import jakarta.validation.constraints.NotNull;
 import java.time.LocalDate;
 
-public record ValidateCraRequestDto(
+public record SignProviderRequestDto(
         @NotNull LocalDate providerSignatureDate
 ) {
 }
diff --git a/backend/src/main/java/com/timizerlike/cra/service/CraDayUpdateService.java b/backend/src/main/java/com/timizerlike/cra/service/CraDayUpdateService.java
index 682987ca..83fb5efd 100644
--- a/backend/src/main/java/com/timizerlike/cra/service/CraDayUpdateService.java
+++ b/backend/src/main/java/com/timizerlike/cra/service/CraDayUpdateService.java
@@ -10,6 +10,7 @@
 import com.timizer.backend.cra.CraDayEntry;
 import com.timizer.backend.cra.CraDayEntryRepository;
 import com.timizer.backend.cra.CraDayNotFoundException;
+import com.timizer.backend.cra.CraDetailsMapper;
 import com.timizer.backend.cra.CraNotFoundException;
 import com.timizer.backend.cra.CraValidatedException;
 import com.timizer.backend.cra.MonthlyCraReport;
@@ -63,7 +64,7 @@ private static CraDetailsDto buildDto(MonthlyCraReport cra, List<CraDayEntry> en
             days.add(new CraDayEntryDto(e.getDate().getDayOfMonth(), e.getWorkValue(), e.getNote()));
             total += e.getWorkValue();
         }
-        CraStatus status = cra.getStatus() == ValidationStatus.VALIDATED ? CraStatus.VALIDATED : CraStatus.DRAFT;
+        CraStatus status = CraDetailsMapper.mapStatus(cra.getStatus());
         return new CraDetailsDto(
                 cra.getId(),
                 cra.getMonth(),
diff --git a/backend/src/main/java/com/timizerlike/cra/service/CraHistoryService.java b/backend/src/main/java/com/timizerlike/cra/service/CraHistoryService.java
index 6aa8b628..14922b53 100644
--- a/backend/src/main/java/com/timizerlike/cra/service/CraHistoryService.java
+++ b/backend/src/main/java/com/timizerlike/cra/service/CraHistoryService.java
@@ -5,10 +5,10 @@
 import org.springframework.stereotype.Service;
 import org.springframework.transaction.annotation.Transactional;
 
+import com.timizer.backend.cra.CraDetailsMapper;
 import com.timizer.backend.cra.CraTotalCalculationService;
 import com.timizer.backend.cra.MonthlyCraReport;
 import com.timizer.backend.cra.MonthlyCraReportRepository;
-import com.timizer.backend.cra.ValidationStatus;
 import com.timizerlike.backend.cra.dto.CraStatus;
 import com.timizerlike.backend.cra.dto.CraSummaryDto;
 
@@ -34,9 +34,7 @@ public List<CraSummaryDto> listHistory() {
 
     private CraSummaryDto toSummary(MonthlyCraReport report) {
         double total = calculationService.calculateTotalWorkedDays(report.getDayEntries());
-        CraStatus status = report.getStatus() == ValidationStatus.VALIDATED
-                ? CraStatus.VALIDATED
-                : CraStatus.DRAFT;
+        CraStatus status = CraDetailsMapper.mapStatus(report.getStatus());
         return new CraSummaryDto(
                 report.getId(),
                 report.getMonth(),
diff --git a/backend/src/main/java/com/timizerlike/cra/service/CraPdfDownloadService.java b/backend/src/main/java/com/timizerlike/cra/service/CraPdfDownloadService.java
index 141acf40..a57da0a2 100644
--- a/backend/src/main/java/com/timizerlike/cra/service/CraPdfDownloadService.java
+++ b/backend/src/main/java/com/timizerlike/cra/service/CraPdfDownloadService.java
@@ -40,7 +40,8 @@ public CraPdfDownloadResult download(Long craId) {
         MonthlyCraReport cra = craRepository.findById(craId)
                 .orElseThrow(() -> new CraNotFoundException(craId));
 
-        if (cra.getStatus() != ValidationStatus.VALIDATED) {
+        if (cra.getStatus() == ValidationStatus.DRAFT
+                || cra.getStatus() == ValidationStatus.READY_FOR_PROVIDER_SIGNATURE) {
             throw new CraNotValidatedException(craId);
         }
 
diff --git a/backend/src/main/java/com/timizerlike/cra/service/CraSignatureTransitionService.java b/backend/src/main/java/com/timizerlike/cra/service/CraSignatureTransitionService.java
new file mode 100644
index 00000000..86ce4f84
--- /dev/null
+++ b/backend/src/main/java/com/timizerlike/cra/service/CraSignatureTransitionService.java
@@ -0,0 +1,73 @@
+package com.timizerlike.cra.service;
+
+import java.time.LocalDate;
+
+import org.springframework.stereotype.Service;
+import org.springframework.transaction.annotation.Transactional;
+
+import com.timizer.backend.cra.CraDetailsMapper;
+import com.timizer.backend.cra.CraNotFoundException;
+import com.timizer.backend.cra.DuplicateCraTransitionException;
+import com.timizer.backend.cra.InvalidCraTransitionException;
+import com.timizer.backend.cra.MonthlyCraReport;
+import com.timizer.backend.cra.MonthlyCraReportRepository;
+import com.timizer.backend.cra.ValidationStatus;
+import com.timizerlike.backend.cra.dto.CraDetailsDto;
+
+@Service
+public class CraSignatureTransitionService {
+
+    private final MonthlyCraReportRepository craRepository;
+
+    public CraSignatureTransitionService(MonthlyCraReportRepository craRepository) {
+        this.craRepository = craRepository;
+    }
+
+    @Transactional
+    public CraDetailsDto submit(Long craId) {
+        MonthlyCraReport cra = findCra(craId);
+        if (cra.getStatus() == ValidationStatus.READY_FOR_PROVIDER_SIGNATURE) {
+            throw new DuplicateCraTransitionException(craId, ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
+        }
+        if (cra.getStatus() != ValidationStatus.DRAFT) {
+            throw new InvalidCraTransitionException(craId, cra.getStatus(), "submit");
+        }
+        cra.setStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
+        craRepository.save(cra);
+        return CraDetailsMapper.toDto(cra);
+    }
+
+    @Transactional
+    public CraDetailsDto signByProvider(Long craId, LocalDate providerSignatureDate) {
+        MonthlyCraReport cra = findCra(craId);
+        if (cra.getStatus() == ValidationStatus.SIGNED_BY_PROVIDER) {
+            throw new DuplicateCraTransitionException(craId, ValidationStatus.SIGNED_BY_PROVIDER);
+        }
+        if (cra.getStatus() != ValidationStatus.READY_FOR_PROVIDER_SIGNATURE) {
+            throw new InvalidCraTransitionException(craId, cra.getStatus(), "sign-provider");
+        }
+        cra.setStatus(ValidationStatus.SIGNED_BY_PROVIDER);
+        cra.setProviderSignatureDate(providerSignatureDate);
+        craRepository.save(cra);
+        return CraDetailsMapper.toDto(cra);
+    }
+
+    @Transactional
+    public CraDetailsDto sendToClient(Long craId) {
+        MonthlyCraReport cra = findCra(craId);
+        if (cra.getStatus() == ValidationStatus.AWAITING_CLIENT_SIGNATURE) {
+            throw new DuplicateCraTransitionException(craId, ValidationStatus.AWAITING_CLIENT_SIGNATURE);
+        }
+        if (cra.getStatus() != ValidationStatus.SIGNED_BY_PROVIDER) {
+            throw new InvalidCraTransitionException(craId, cra.getStatus(), "send-to-client");
+        }
+        cra.setStatus(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
+        craRepository.save(cra);
+        return CraDetailsMapper.toDto(cra);
+    }
+
+    private MonthlyCraReport findCra(Long craId) {
+        return craRepository.findById(craId)
+                .orElseThrow(() -> new CraNotFoundException(craId));
+    }
+}
diff --git a/backend/src/main/java/com/timizerlike/cra/service/CraValidationService.java b/backend/src/main/java/com/timizerlike/cra/service/CraValidationService.java
deleted file mode 100644
index f532c015..00000000
--- a/backend/src/main/java/com/timizerlike/cra/service/CraValidationService.java
+++ /dev/null
@@ -1,42 +0,0 @@
-package com.timizerlike.cra.service;
-
-import java.time.LocalDate;
-
-import org.springframework.stereotype.Service;
-import org.springframework.transaction.annotation.Transactional;
-
-import com.timizer.backend.cra.CraDetailsMapper;
-import com.timizer.backend.cra.CraNotFoundException;
-import com.timizer.backend.cra.CraValidatedException;
-import com.timizer.backend.cra.MonthlyCraReport;
-import com.timizer.backend.cra.MonthlyCraReportRepository;
-import com.timizer.backend.cra.ValidationStatus;
-import com.timizerlike.backend.cra.dto.CraDetailsDto;
-
-@Service
-public class CraValidationService {
-
-    private final MonthlyCraReportRepository craRepository;
-
-    public CraValidationService(MonthlyCraReportRepository craRepository) {
-        this.craRepository = craRepository;
-    }
-
-    @Transactional
-    public CraDetailsDto validate(Long craId, LocalDate providerSignatureDate) {
-        MonthlyCraReport cra = craRepository.findById(craId)
-                .orElseThrow(() -> new CraNotFoundException(craId));
-
-        if (cra.getStatus() != ValidationStatus.DRAFT) {
-            throw new CraValidatedException(craId);
-        }
-
-        cra.setStatus(ValidationStatus.VALIDATED);
-        cra.setProviderSignatureDate(providerSignatureDate);
-        cra.setValidationDate(LocalDate.now());
-
-        craRepository.save(cra);
-
-        return CraDetailsMapper.toDto(cra);
-    }
-}
diff --git a/backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java b/backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java
index 3110e7aa..78448973 100644
--- a/backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java
+++ b/backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java
@@ -42,6 +42,12 @@ void returnsHttp201WhenCraIsCreated() throws Exception {
                 CraStatus.DRAFT,
                 List.of(new CraDayEntryDto(1, 0.0, null), new CraDayEntryDto(2, 0.0, null)),
                 null,
+                null,
+                null,
+                null,
+                null,
+                null,
+                null,
                 null
         );
         when(creationService.createForMonth(2025, 3)).thenReturn(new CraCreationResult(dto, true));
@@ -67,6 +73,12 @@ void returnsHttp200WhenCraAlreadyExists() throws Exception {
                 CraStatus.DRAFT,
                 List.of(),
                 null,
+                null,
+                null,
+                null,
+                null,
+                null,
+                null,
                 null
         );
         when(creationService.createForMonth(2025, 4)).thenReturn(new CraCreationResult(dto, false));
diff --git a/backend/src/test/java/com/timizerlike/backend/cra/dto/CraDtoTest.java b/backend/src/test/java/com/timizerlike/backend/cra/dto/CraDtoTest.java
index c2789eed..92a58c93 100644
--- a/backend/src/test/java/com/timizerlike/backend/cra/dto/CraDtoTest.java
+++ b/backend/src/test/java/com/timizerlike/backend/cra/dto/CraDtoTest.java
@@ -13,9 +13,16 @@
 class CraDtoTest {
 
     @Test
-    void craStatusExposesDraftAndValidated() {
+    void craStatusExposesAllWorkflowValues() {
         assertArrayEquals(
-                new CraStatus[]{CraStatus.DRAFT, CraStatus.VALIDATED},
+                new CraStatus[]{
+                        CraStatus.DRAFT,
+                        CraStatus.READY_FOR_PROVIDER_SIGNATURE,
+                        CraStatus.SIGNED_BY_PROVIDER,
+                        CraStatus.AWAITING_CLIENT_SIGNATURE,
+                        CraStatus.FULLY_SIGNED,
+                        CraStatus.VALIDATED,
+                },
                 CraStatus.values()
         );
     }
diff --git a/backend/src/test/java/com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest.java b/backend/src/test/java/com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest.java
new file mode 100644
index 00000000..05f56d23
--- /dev/null
+++ b/backend/src/test/java/com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest.java
@@ -0,0 +1,143 @@
+package com.timizerlike.backend.cra.integration;
+
+import static org.assertj.core.api.Assertions.assertThat;
+
+import java.util.Map;
+
+import org.apache.hc.client5.http.impl.classic.HttpClients;
+import org.junit.jupiter.api.BeforeEach;
+import org.junit.jupiter.api.Test;
+import org.springframework.beans.factory.annotation.Autowired;
+import org.springframework.boot.test.context.SpringBootTest;
+import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
+import org.springframework.boot.test.web.client.TestRestTemplate;
+import org.springframework.core.ParameterizedTypeReference;
+import org.springframework.http.HttpEntity;
+import org.springframework.http.HttpMethod;
+import org.springframework.http.HttpStatus;
+import org.springframework.http.MediaType;
+import org.springframework.http.ResponseEntity;
+import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
+
+import com.timizerlike.cra.TimizerLikeApplication;
+
+@SpringBootTest(classes = TimizerLikeApplication.class, webEnvironment = WebEnvironment.RANDOM_PORT)
+class CraSignatureWorkflowIntegrationTest {
+
+    @Autowired
+    private TestRestTemplate restTemplate;
+
+    @BeforeEach
+    void setUp() {
+        restTemplate.getRestTemplate().setRequestFactory(
+                new HttpComponentsClientHttpRequestFactory(HttpClients.createDefault()));
+    }
+
+    @Test
+    @SuppressWarnings("unchecked")
+    void fullSignatureWorkflow() {
+        // Step 1: Create a CRA — expect 201 DRAFT
+        Map<String, Object> createBody = Map.of("year", 2026, "month", 8);
+        ResponseEntity<Map<String, Object>> createResponse = restTemplate.exchange(
+                "/api/cra", HttpMethod.POST,
+                new HttpEntity<>(createBody),
+                new ParameterizedTypeReference<>() {});
+
+        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
+        Map<String, Object> cra = createResponse.getBody();
+        assertThat(cra).isNotNull();
+        assertThat(cra.get("status")).isEqualTo("DRAFT");
+        Long craId = ((Number) cra.get("id")).longValue();
+
+        // Verify PDF rejected for DRAFT (422)
+        ResponseEntity<Map<String, Object>> pdfDraftResponse = restTemplate.exchange(
+                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null,
+                new ParameterizedTypeReference<>() {});
+        assertThat(pdfDraftResponse.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
+
+        // Verify day update rejected for non-DRAFT after submit (first verify update works while DRAFT)
+        Map<String, Object> dayBody = Map.of("workValue", 1.0);
+        ResponseEntity<Map<String, Object>> dayResponse = restTemplate.exchange(
+                "/api/cras/" + craId + "/days/2026-08-04",
+                HttpMethod.PATCH,
+                new HttpEntity<>(dayBody),
+                new ParameterizedTypeReference<>() {});
+        assertThat(dayResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
+
+        // Step 2: Submit — DRAFT → READY_FOR_PROVIDER_SIGNATURE
+        ResponseEntity<Map<String, Object>> submitResponse = restTemplate.exchange(
+                "/api/cras/" + craId + "/submit",
+                HttpMethod.POST,
+                new HttpEntity<>(null),
+                new ParameterizedTypeReference<>() {});
+
+        assertThat(submitResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
+        assertThat(submitResponse.getBody()).isNotNull();
+        assertThat(submitResponse.getBody().get("status")).isEqualTo("READY_FOR_PROVIDER_SIGNATURE");
+
+        // Verify PDF rejected for READY_FOR_PROVIDER_SIGNATURE (422)
+        ResponseEntity<Map<String, Object>> pdfReadyResponse = restTemplate.exchange(
+                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null,
+                new ParameterizedTypeReference<>() {});
+        assertThat(pdfReadyResponse.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);
+
+        // Verify day update rejected after submit (409)
+        ResponseEntity<Map<String, Object>> dayUpdateRejected = restTemplate.exchange(
+                "/api/cras/" + craId + "/days/2026-08-04",
+                HttpMethod.PATCH,
+                new HttpEntity<>(dayBody),
+                new ParameterizedTypeReference<>() {});
+        assertThat(dayUpdateRejected.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
+
+        // Verify duplicate submit returns 409 duplicate_cra_transition
+        ResponseEntity<Map<String, Object>> duplicateSubmit = restTemplate.exchange(
+                "/api/cras/" + craId + "/submit",
+                HttpMethod.POST,
+                new HttpEntity<>(null),
+                new ParameterizedTypeReference<>() {});
+        assertThat(duplicateSubmit.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
+        assertThat(duplicateSubmit.getBody()).isNotNull();
+        assertThat(duplicateSubmit.getBody().get("error")).isEqualTo("duplicate_cra_transition");
+
+        // Verify invalid transition (READY_FOR_PROVIDER_SIGNATURE → send-to-client) returns 409 invalid_cra_transition
+        ResponseEntity<Map<String, Object>> invalidTransition = restTemplate.exchange(
+                "/api/cras/" + craId + "/send-to-client",
+                HttpMethod.POST,
+                new HttpEntity<>(null),
+                new ParameterizedTypeReference<>() {});
+        assertThat(invalidTransition.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
+        assertThat(invalidTransition.getBody()).isNotNull();
+        assertThat(invalidTransition.getBody().get("error")).isEqualTo("invalid_cra_transition");
+
+        // Step 3: Sign by provider — READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER
+        Map<String, Object> signBody = Map.of("providerSignatureDate", "2026-08-31");
+        ResponseEntity<Map<String, Object>> signResponse = restTemplate.exchange(
+                "/api/cras/" + craId + "/sign-provider",
+                HttpMethod.POST,
+                new HttpEntity<>(signBody),
+                new ParameterizedTypeReference<>() {});
+
+        assertThat(signResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
+        assertThat(signResponse.getBody()).isNotNull();
+        assertThat(signResponse.getBody().get("status")).isEqualTo("SIGNED_BY_PROVIDER");
+        assertThat(signResponse.getBody().get("providerSignatureDate")).isEqualTo("2026-08-31");
+
+        // Verify PDF accepted for SIGNED_BY_PROVIDER (200)
+        ResponseEntity<byte[]> pdfSignedResponse = restTemplate.exchange(
+                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null, byte[].class);
+        assertThat(pdfSignedResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
+        assertThat(pdfSignedResponse.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
+        assertThat(pdfSignedResponse.getBody()).isNotEmpty();
+
+        // Step 4: Send to client — SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE
+        ResponseEntity<Map<String, Object>> sendResponse = restTemplate.exchange(
+                "/api/cras/" + craId + "/send-to-client",
+                HttpMethod.POST,
+                new HttpEntity<>(null),
+                new ParameterizedTypeReference<>() {});
+
+        assertThat(sendResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
+        assertThat(sendResponse.getBody()).isNotNull();
+        assertThat(sendResponse.getBody().get("status")).isEqualTo("AWAITING_CLIENT_SIGNATURE");
+    }
+}
diff --git a/backend/src/test/java/com/timizerlike/backend/cra/integration/CraWorkflowIntegrationTest.java b/backend/src/test/java/com/timizerlike/backend/cra/integration/CraWorkflowIntegrationTest.java
deleted file mode 100644
index a49e637b..00000000
--- a/backend/src/test/java/com/timizerlike/backend/cra/integration/CraWorkflowIntegrationTest.java
+++ /dev/null
@@ -1,98 +0,0 @@
-package com.timizerlike.backend.cra.integration;
-
-import static org.assertj.core.api.Assertions.assertThat;
-
-import java.util.List;
-import java.util.Map;
-
-import org.apache.hc.client5.http.impl.classic.HttpClients;
-import org.junit.jupiter.api.BeforeEach;
-import org.junit.jupiter.api.Test;
-import org.springframework.beans.factory.annotation.Autowired;
-import org.springframework.boot.test.context.SpringBootTest;
-import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
-import org.springframework.boot.test.web.client.TestRestTemplate;
-import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
-
-import com.timizerlike.cra.TimizerLikeApplication;
-import org.springframework.core.ParameterizedTypeReference;
-import org.springframework.http.HttpEntity;
-import org.springframework.http.HttpMethod;
-import org.springframework.http.HttpStatus;
-import org.springframework.http.MediaType;
-import org.springframework.http.ResponseEntity;
-
-@SpringBootTest(classes = TimizerLikeApplication.class, webEnvironment = WebEnvironment.RANDOM_PORT)
-class CraWorkflowIntegrationTest {
-
-    @Autowired
-    private TestRestTemplate restTemplate;
-
-    @BeforeEach
-    void setUp() {
-        restTemplate.getRestTemplate().setRequestFactory(
-                new HttpComponentsClientHttpRequestFactory(HttpClients.createDefault()));
-    }
-
-    @Test
-    @SuppressWarnings("unchecked")
-    void fullCraWorkflow() {
-        // Step 1: Create a CRA for July 2026 — expect 201 DRAFT
-        Map<String, Object> createBody = Map.of("year", 2026, "month", 7);
-        ResponseEntity<Map<String, Object>> createResponse = restTemplate.exchange(
-                "/api/cra", HttpMethod.POST,
-                new HttpEntity<>(createBody),
-                new ParameterizedTypeReference<>() {});
-
-        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
-        Map<String, Object> cra = createResponse.getBody();
-        assertThat(cra).isNotNull();
-        assertThat(cra.get("status")).isEqualTo("DRAFT");
-        Long craId = ((Number) cra.get("id")).longValue();
-
-        // Step 2: Update a workday to 0.5 — expect 200 and totalWorkedDays > 0
-        Map<String, Object> dayBody = Map.of("workValue", 0.5);
-        ResponseEntity<Map<String, Object>> dayResponse = restTemplate.exchange(
-                "/api/cras/" + craId + "/days/2026-07-01",
-                HttpMethod.PATCH,
-                new HttpEntity<>(dayBody),
-                new ParameterizedTypeReference<>() {});
-
-        assertThat(dayResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
-        Map<String, Object> updatedCra = dayResponse.getBody();
-        assertThat(updatedCra).isNotNull();
-        assertThat(((Number) updatedCra.get("totalWorkedDays")).doubleValue()).isGreaterThan(0.0);
-
-        // Step 3: Validate the CRA — expect 200 VALIDATED
-        Map<String, Object> validateBody = Map.of("providerSignatureDate", "2026-07-31");
-        ResponseEntity<Map<String, Object>> validateResponse = restTemplate.exchange(
-                "/api/cras/" + craId + "/validate",
-                HttpMethod.POST,
-                new HttpEntity<>(validateBody),
-                new ParameterizedTypeReference<>() {});
-
-        assertThat(validateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
-        assertThat(validateResponse.getBody()).isNotNull();
-        assertThat(validateResponse.getBody().get("status")).isEqualTo("VALIDATED");
-
-        // Step 4: List history — expect 200 and list contains the CRA id
-        ResponseEntity<List<Map<String, Object>>> historyResponse = restTemplate.exchange(
-                "/api/cras", HttpMethod.GET, null,
-                new ParameterizedTypeReference<>() {});
-
-        assertThat(historyResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
-        List<Map<String, Object>> history = historyResponse.getBody();
-        assertThat(history).isNotNull().isNotEmpty();
-        boolean found = history.stream()
-                .anyMatch(item -> craId.equals(((Number) item.get("id")).longValue()));
-        assertThat(found).isTrue();
-
-        // Step 5: Download PDF — expect 200 application/pdf with non-empty body
-        ResponseEntity<byte[]> pdfResponse = restTemplate.exchange(
-                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null, byte[].class);
-
-        assertThat(pdfResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
-        assertThat(pdfResponse.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
-        assertThat(pdfResponse.getBody()).isNotEmpty();
-    }
-}
diff --git a/backend/src/test/java/com/timizerlike/backend/cra/web/CraValidationControllerTest.java b/backend/src/test/java/com/timizerlike/backend/cra/web/CraValidationControllerTest.java
deleted file mode 100644
index c4c3a4a4..00000000
--- a/backend/src/test/java/com/timizerlike/backend/cra/web/CraValidationControllerTest.java
+++ /dev/null
@@ -1,90 +0,0 @@
-package com.timizerlike.backend.cra.web;
-
-import static org.mockito.ArgumentMatchers.any;
-import static org.mockito.ArgumentMatchers.eq;
-import static org.mockito.Mockito.when;
-import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
-import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
-import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
-
-import java.time.LocalDate;
-import java.util.List;
-
-import org.junit.jupiter.api.Test;
-import org.springframework.beans.factory.annotation.Autowired;
-import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
-import org.springframework.boot.test.mock.mockito.MockBean;
-import org.springframework.context.annotation.Import;
-import org.springframework.http.MediaType;
-import org.springframework.test.web.servlet.MockMvc;
-
-import com.timizer.backend.cra.CraNotFoundException;
-import com.timizer.backend.cra.CraValidatedException;
-import com.timizerlike.backend.cra.dto.CraDetailsDto;
-import com.timizerlike.backend.cra.dto.CraStatus;
-import com.timizerlike.cra.service.CraValidationService;
-
-@WebMvcTest(CraValidationController.class)
-@Import({CraValidationController.class, CraApiExceptionHandler.class})
-class CraValidationControllerTest {
-
-    @Autowired
-    private MockMvc mockMvc;
-
-    @MockBean
-    private CraValidationService validationService;
-
-    private static final CraDetailsDto VALIDATED_DTO = new CraDetailsDto(
-            1L, 6, 2026, 20.0, CraStatus.VALIDATED,
-            List.of(),
-            LocalDate.of(2026, 6, 30),
-            LocalDate.of(2026, 6, 30),
-            null, null, null, null, null, null);
-
-    @Test
-    void returnsHttp200WithValidatedDtoOnSuccess() throws Exception {
-        when(validationService.validate(eq(1L), any(LocalDate.class)))
-                .thenReturn(VALIDATED_DTO);
-
-        mockMvc.perform(post("/api/cras/1/validate")
-                        .contentType(MediaType.APPLICATION_JSON)
-                        .content("{\"providerSignatureDate\":\"2026-06-30\"}"))
-                .andExpect(status().isOk())
-                .andExpect(jsonPath("$.id").value(1))
-                .andExpect(jsonPath("$.status").value("VALIDATED"))
-                .andExpect(jsonPath("$.validationDate").value("2026-06-30"))
-                .andExpect(jsonPath("$.providerSignatureDate").value("2026-06-30"));
-    }
-
-    @Test
-    void returnsHttp404WhenCraNotFound() throws Exception {
-        when(validationService.validate(any(), any()))
-                .thenThrow(new CraNotFoundException(99L));
-
-        mockMvc.perform(post("/api/cras/99/validate")
-                        .contentType(MediaType.APPLICATION_JSON)
-                        .content("{\"providerSignatureDate\":\"2026-06-30\"}"))
-                .andExpect(status().isNotFound())
-                .andExpect(jsonPath("$.error").value("cra_not_found"));
-    }
-
-    @Test
-    void returnsHttp409WhenCraAlreadyValidated() throws Exception {
-        when(validationService.validate(any(), any()))
-                .thenThrow(new CraValidatedException(1L));
-
-        mockMvc.perform(post("/api/cras/1/validate")
-                        .contentType(MediaType.APPLICATION_JSON)
-                        .content("{\"providerSignatureDate\":\"2026-06-30\"}"))
-                .andExpect(status().isConflict())
-                .andExpect(jsonPath("$.error").value("cra_validated"));
-    }
-
-    @Test
-    void returnsHttp400WhenProviderSignatureDateMissing() throws Exception {
-        mockMvc.perform(post("/api/cras/1/validate")
-                        .contentType(MediaType.APPLICATION_JSON)
-                        .content("{}"))
-                .andExpect(status().isBadRequest());
-    }
-}
diff --git a/backend/src/test/java/com/timizerlike/cra/service/CraDayUpdateServiceTest.java b/backend/src/test/java/com/timizerlike/cra/service/CraDayUpdateServiceTest.java
index fbc1befb..df7a4afd 100644
--- a/backend/src/test/java/com/timizerlike/cra/service/CraDayUpdateServiceTest.java
+++ b/backend/src/test/java/com/timizerlike/cra/service/CraDayUpdateServiceTest.java
@@ -171,6 +171,36 @@ void rejectsUpdateOnSignedByProviderCra() {
                 .isInstanceOf(CraValidatedException.class);
     }
 
+    @Test
+    void rejectsUpdateOnReadyForProviderSignatureCra() {
+        MonthlyCraReport cra = mock(MonthlyCraReport.class);
+        when(cra.getStatus()).thenReturn(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+
+        assertThatThrownBy(() -> service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.5, null)))
+                .isInstanceOf(CraValidatedException.class);
+    }
+
+    @Test
+    void rejectsUpdateOnAwaitingClientSignatureCra() {
+        MonthlyCraReport cra = mock(MonthlyCraReport.class);
+        when(cra.getStatus()).thenReturn(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+
+        assertThatThrownBy(() -> service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.5, null)))
+                .isInstanceOf(CraValidatedException.class);
+    }
+
+    @Test
+    void rejectsUpdateOnFullySignedCra() {
+        MonthlyCraReport cra = mock(MonthlyCraReport.class);
+        when(cra.getStatus()).thenReturn(ValidationStatus.FULLY_SIGNED);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+
+        assertThatThrownBy(() -> service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.5, null)))
+                .isInstanceOf(CraValidatedException.class);
+    }
+
     @Test
     void throwsCraNotFoundWhenCraAbsent() {
         when(craRepository.findById(CRA_ID)).thenReturn(Optional.empty());
diff --git a/backend/src/test/java/com/timizerlike/cra/service/CraHistoryServiceTest.java b/backend/src/test/java/com/timizerlike/cra/service/CraHistoryServiceTest.java
index 0fcf9b2e..b647725a 100644
--- a/backend/src/test/java/com/timizerlike/cra/service/CraHistoryServiceTest.java
+++ b/backend/src/test/java/com/timizerlike/cra/service/CraHistoryServiceTest.java
@@ -67,20 +67,20 @@ void mapsValidatedReportWithValidationDate() {
         List<CraSummaryDto> result = service.listHistory();
 
         CraSummaryDto summary = result.get(0);
-        assertThat(summary.status()).isEqualTo(CraStatus.VALIDATED);
+        assertThat(summary.status()).isEqualTo(CraStatus.FULLY_SIGNED);
         assertThat(summary.validationDate()).isEqualTo(validationDate);
         assertThat(summary.totalWorkedDays()).isEqualTo(20.0);
     }
 
     @Test
-    void mapsSignedByProviderAsDraft() {
+    void mapsSignedByProviderStatus() {
         MonthlyCraReport cra = mockReport(3L, 5, 2026, ValidationStatus.SIGNED_BY_PROVIDER, null, List.of());
         when(craRepository.findAllByOrderByYearDescMonthDesc()).thenReturn(List.of(cra));
         when(calculationService.calculateTotalWorkedDays(List.of())).thenReturn(10.0);
 
         List<CraSummaryDto> result = service.listHistory();
 
-        assertThat(result.get(0).status()).isEqualTo(CraStatus.DRAFT);
+        assertThat(result.get(0).status()).isEqualTo(CraStatus.SIGNED_BY_PROVIDER);
     }
 
     @Test
diff --git a/backend/src/test/java/com/timizerlike/cra/service/CraPdfDownloadServiceTest.java b/backend/src/test/java/com/timizerlike/cra/service/CraPdfDownloadServiceTest.java
index f78ad5fa..5b42e08f 100644
--- a/backend/src/test/java/com/timizerlike/cra/service/CraPdfDownloadServiceTest.java
+++ b/backend/src/test/java/com/timizerlike/cra/service/CraPdfDownloadServiceTest.java
@@ -49,7 +49,7 @@ void throwsCraNotFoundWhenCraAbsent() {
     }
 
     @Test
-    void throwsCraNotValidatedWhenCraIsNotValidated() {
+    void throwsCraNotValidatedWhenCraIsInDraftStatus() {
         MonthlyCraReport cra = mock(MonthlyCraReport.class);
         when(cra.getStatus()).thenReturn(ValidationStatus.DRAFT);
         when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
@@ -60,6 +60,54 @@ void throwsCraNotValidatedWhenCraIsNotValidated() {
         verify(pdfGenerator, never()).generate(any());
     }
 
+    @Test
+    void throwsCraNotValidatedWhenCraIsReadyForProviderSignature() {
+        MonthlyCraReport cra = mock(MonthlyCraReport.class);
+        when(cra.getStatus()).thenReturn(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+
+        assertThatThrownBy(() -> service.download(CRA_ID))
+                .isInstanceOf(CraNotValidatedException.class);
+
+        verify(pdfGenerator, never()).generate(any());
+    }
+
+    @Test
+    void returnsPdfBytesForSignedByProviderCra() {
+        MonthlyCraReport cra = signedByProviderCra();
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+        byte[] pdfBytes = new byte[]{1, 2, 3};
+        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(pdfBytes);
+
+        CraPdfDownloadResult result = service.download(CRA_ID);
+
+        assertThat(result.content()).isEqualTo(pdfBytes);
+    }
+
+    @Test
+    void returnsPdfBytesForAwaitingClientSignatureCra() {
+        MonthlyCraReport cra = signedByProviderCra();
+        when(cra.getStatus()).thenReturn(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});
+
+        CraPdfDownloadResult result = service.download(CRA_ID);
+
+        assertThat(result).isNotNull();
+    }
+
+    @Test
+    void returnsPdfBytesForFullySignedCra() {
+        MonthlyCraReport cra = signedByProviderCra();
+        when(cra.getStatus()).thenReturn(ValidationStatus.FULLY_SIGNED);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});
+
+        CraPdfDownloadResult result = service.download(CRA_ID);
+
+        assertThat(result).isNotNull();
+    }
+
     @Test
     void returnsPdfBytesForValidatedCra() {
         MonthlyCraReport cra = validatedCra();
@@ -122,4 +170,22 @@ private MonthlyCraReport validatedCra() {
         when(cra.getDayEntries()).thenReturn(List.of());
         return cra;
     }
+
+    private MonthlyCraReport signedByProviderCra() {
+        MonthlyCraReport cra = mock(MonthlyCraReport.class);
+        when(cra.getId()).thenReturn(CRA_ID);
+        when(cra.getMonth()).thenReturn(6);
+        when(cra.getYear()).thenReturn(2026);
+        when(cra.getStatus()).thenReturn(ValidationStatus.SIGNED_BY_PROVIDER);
+        when(cra.getProviderFirstName()).thenReturn("John");
+        when(cra.getProviderLastName()).thenReturn("Doe");
+        when(cra.getProviderCompany()).thenReturn("Acme");
+        when(cra.getClientFirstName()).thenReturn("Jane");
+        when(cra.getClientLastName()).thenReturn("Smith");
+        when(cra.getClientCompany()).thenReturn("ClientCo");
+        when(cra.getClientContactEmail()).thenReturn("jane@clientco.com");
+        when(cra.getProviderSignatureDate()).thenReturn(LocalDate.of(2026, 6, 30));
+        when(cra.getDayEntries()).thenReturn(List.of());
+        return cra;
+    }
 }
diff --git a/backend/src/test/java/com/timizerlike/cra/service/CraSignatureTransitionServiceTest.java b/backend/src/test/java/com/timizerlike/cra/service/CraSignatureTransitionServiceTest.java
new file mode 100644
index 00000000..1c75967c
--- /dev/null
+++ b/backend/src/test/java/com/timizerlike/cra/service/CraSignatureTransitionServiceTest.java
@@ -0,0 +1,185 @@
+package com.timizerlike.cra.service;
+
+import static org.assertj.core.api.Assertions.assertThat;
+import static org.assertj.core.api.Assertions.assertThatThrownBy;
+import static org.mockito.ArgumentMatchers.any;
+import static org.mockito.Mockito.doAnswer;
+import static org.mockito.Mockito.mock;
+import static org.mockito.Mockito.never;
+import static org.mockito.Mockito.verify;
+import static org.mockito.Mockito.when;
+
+import java.time.LocalDate;
+import java.util.List;
+import java.util.Optional;
+import java.util.concurrent.atomic.AtomicReference;
+
+import org.junit.jupiter.api.BeforeEach;
+import org.junit.jupiter.api.Test;
+import org.junit.jupiter.params.ParameterizedTest;
+import org.junit.jupiter.params.provider.EnumSource;
+import org.junit.jupiter.params.provider.EnumSource.Mode;
+
+import com.timizer.backend.cra.CraNotFoundException;
+import com.timizer.backend.cra.DuplicateCraTransitionException;
+import com.timizer.backend.cra.InvalidCraTransitionException;
+import com.timizer.backend.cra.MonthlyCraReport;
+import com.timizer.backend.cra.MonthlyCraReportRepository;
+import com.timizer.backend.cra.ValidationStatus;
+import com.timizerlike.backend.cra.dto.CraDetailsDto;
+import com.timizerlike.backend.cra.dto.CraStatus;
+
+class CraSignatureTransitionServiceTest {
+
+    private static final Long CRA_ID = 1L;
+    private static final LocalDate JULY_31 = LocalDate.of(2026, 7, 31);
+
+    private MonthlyCraReportRepository craRepository;
+    private CraSignatureTransitionService service;
+
+    @BeforeEach
+    void setUp() {
+        craRepository = mock(MonthlyCraReportRepository.class);
+        service = new CraSignatureTransitionService(craRepository);
+    }
+
+    // --- submit ---
+
+    @Test
+    void submitTransitionsDraftToReadyForProviderSignature() {
+        MonthlyCraReport cra = craWithStatus(ValidationStatus.DRAFT);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+        when(craRepository.save(cra)).thenReturn(cra);
+
+        CraDetailsDto result = service.submit(CRA_ID);
+
+        verify(cra).setStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
+        verify(craRepository).save(cra);
+        assertThat(result.status()).isEqualTo(CraStatus.READY_FOR_PROVIDER_SIGNATURE);
+    }
+
+    @Test
+    void submitThrowsDuplicateWhenAlreadyReadyForProviderSignature() {
+        MonthlyCraReport cra = craWithStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+
+        assertThatThrownBy(() -> service.submit(CRA_ID))
+                .isInstanceOf(DuplicateCraTransitionException.class);
+        verify(craRepository, never()).save(any());
+    }
+
+    @ParameterizedTest
+    @EnumSource(value = ValidationStatus.class, names = {"DRAFT", "READY_FOR_PROVIDER_SIGNATURE"}, mode = Mode.EXCLUDE)
+    void submitThrowsInvalidTransitionForNonDraftStatus(ValidationStatus status) {
+        MonthlyCraReport cra = craWithStatus(status);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+
+        assertThatThrownBy(() -> service.submit(CRA_ID))
+                .isInstanceOf(InvalidCraTransitionException.class);
+        verify(craRepository, never()).save(any());
+    }
+
+    @Test
+    void submitThrowsCraNotFoundWhenAbsent() {
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.empty());
+
+        assertThatThrownBy(() -> service.submit(CRA_ID))
+                .isInstanceOf(CraNotFoundException.class);
+    }
+
+    // --- signByProvider ---
+
+    @Test
+    void signByProviderTransitionsToSignedByProvider() {
+        MonthlyCraReport cra = craWithStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+        when(craRepository.save(cra)).thenReturn(cra);
+
+        CraDetailsDto result = service.signByProvider(CRA_ID, JULY_31);
+
+        verify(cra).setStatus(ValidationStatus.SIGNED_BY_PROVIDER);
+        verify(cra).setProviderSignatureDate(JULY_31);
+        verify(craRepository).save(cra);
+        assertThat(result.status()).isEqualTo(CraStatus.SIGNED_BY_PROVIDER);
+    }
+
+    @Test
+    void signByProviderSetsProviderSignatureDate() {
+        MonthlyCraReport cra = craWithStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+        when(craRepository.save(cra)).thenReturn(cra);
+
+        service.signByProvider(CRA_ID, JULY_31);
+
+        verify(cra).setProviderSignatureDate(JULY_31);
+    }
+
+    @Test
+    void signByProviderThrowsDuplicateWhenAlreadySignedByProvider() {
+        MonthlyCraReport cra = craWithStatus(ValidationStatus.SIGNED_BY_PROVIDER);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+
+        assertThatThrownBy(() -> service.signByProvider(CRA_ID, JULY_31))
+                .isInstanceOf(DuplicateCraTransitionException.class);
+        verify(craRepository, never()).save(any());
+    }
+
+    @ParameterizedTest
+    @EnumSource(value = ValidationStatus.class, names = {"READY_FOR_PROVIDER_SIGNATURE", "SIGNED_BY_PROVIDER"}, mode = Mode.EXCLUDE)
+    void signByProviderThrowsInvalidTransitionForNonReadyStatus(ValidationStatus status) {
+        MonthlyCraReport cra = craWithStatus(status);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+
+        assertThatThrownBy(() -> service.signByProvider(CRA_ID, JULY_31))
+                .isInstanceOf(InvalidCraTransitionException.class);
+        verify(craRepository, never()).save(any());
+    }
+
+    // --- sendToClient ---
+
+    @Test
+    void sendToClientTransitionsToAwaitingClientSignature() {
+        MonthlyCraReport cra = craWithStatus(ValidationStatus.SIGNED_BY_PROVIDER);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+        when(craRepository.save(cra)).thenReturn(cra);
+
+        CraDetailsDto result = service.sendToClient(CRA_ID);
+
+        verify(cra).setStatus(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
+        verify(craRepository).save(cra);
+        assertThat(result.status()).isEqualTo(CraStatus.AWAITING_CLIENT_SIGNATURE);
+    }
+
+    @Test
+    void sendToClientThrowsDuplicateWhenAlreadyAwaitingClientSignature() {
+        MonthlyCraReport cra = craWithStatus(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+
+        assertThatThrownBy(() -> service.sendToClient(CRA_ID))
+                .isInstanceOf(DuplicateCraTransitionException.class);
+        verify(craRepository, never()).save(any());
+    }
+
+    @ParameterizedTest
+    @EnumSource(value = ValidationStatus.class, names = {"SIGNED_BY_PROVIDER", "AWAITING_CLIENT_SIGNATURE"}, mode = Mode.EXCLUDE)
+    void sendToClientThrowsInvalidTransitionForNonSignedByProviderStatus(ValidationStatus status) {
+        MonthlyCraReport cra = craWithStatus(status);
+        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
+
+        assertThatThrownBy(() -> service.sendToClient(CRA_ID))
+                .isInstanceOf(InvalidCraTransitionException.class);
+        verify(craRepository, never()).save(any());
+    }
+
+    private MonthlyCraReport craWithStatus(ValidationStatus status) {
+        MonthlyCraReport cra = mock(MonthlyCraReport.class);
+        when(cra.getId()).thenReturn(CRA_ID);
+        when(cra.getMonth()).thenReturn(7);
+        when(cra.getYear()).thenReturn(2026);
+        AtomicReference<ValidationStatus> current = new AtomicReference<>(status);
+        when(cra.getStatus()).thenAnswer(inv -> current.get());
+        doAnswer(inv -> { current.set(inv.getArgument(0)); return null; }).when(cra).setStatus(any());
+        when(cra.getDayEntries()).thenReturn(List.of());
+        return cra;
+    }
+}
diff --git a/backend/src/test/java/com/timizerlike/cra/service/CraValidationServiceTest.java b/backend/src/test/java/com/timizerlike/cra/service/CraValidationServiceTest.java
deleted file mode 100644
index 405373e4..00000000
--- a/backend/src/test/java/com/timizerlike/cra/service/CraValidationServiceTest.java
+++ /dev/null
@@ -1,95 +0,0 @@
-package com.timizerlike.cra.service;
-
-import static org.assertj.core.api.Assertions.assertThat;
-import static org.assertj.core.api.Assertions.assertThatThrownBy;
-import static org.mockito.ArgumentMatchers.any;
-import static org.mockito.Mockito.mock;
-import static org.mockito.Mockito.never;
-import static org.mockito.Mockito.verify;
-import static org.mockito.Mockito.when;
-
-import java.time.LocalDate;
-import java.util.List;
-import java.util.Optional;
-
-import org.junit.jupiter.api.BeforeEach;
-import org.junit.jupiter.api.Test;
-
-import com.timizer.backend.cra.CraNotFoundException;
-import com.timizer.backend.cra.CraValidatedException;
-import com.timizer.backend.cra.MonthlyCraReport;
-import com.timizer.backend.cra.MonthlyCraReportRepository;
-import com.timizer.backend.cra.ValidationStatus;
-import com.timizerlike.backend.cra.dto.CraDetailsDto;
-
-class CraValidationServiceTest {
-
-    private static final Long CRA_ID = 1L;
-    private static final LocalDate JUNE_30 = LocalDate.of(2026, 6, 30);
-
-    private MonthlyCraReportRepository craRepository;
-    private CraValidationService service;
-
-    @BeforeEach
-    void setUp() {
-        craRepository = mock(MonthlyCraReportRepository.class);
-        service = new CraValidationService(craRepository);
-    }
-
-    @Test
-    void validatesDraftCraAndSetsAllThreeFields() {
-        MonthlyCraReport cra = draftCra();
-        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
-        when(craRepository.save(cra)).thenReturn(cra);
-
-        service.validate(CRA_ID, JUNE_30);
-
-        verify(cra).setStatus(ValidationStatus.VALIDATED);
-        verify(cra).setProviderSignatureDate(JUNE_30);
-        verify(cra).setValidationDate(any(LocalDate.class));
-        verify(craRepository).save(cra);
-    }
-
-    @Test
-    void throwsCraNotFoundWhenCraAbsent() {
-        when(craRepository.findById(CRA_ID)).thenReturn(Optional.empty());
-
-        assertThatThrownBy(() -> service.validate(CRA_ID, JUNE_30))
-                .isInstanceOf(CraNotFoundException.class);
-    }
-
-    @Test
-    void throwsCraValidatedWhenNotInDraftStatus() {
-        MonthlyCraReport cra = mock(MonthlyCraReport.class);
-        when(cra.getStatus()).thenReturn(ValidationStatus.VALIDATED);
-        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
-
-        assertThatThrownBy(() -> service.validate(CRA_ID, JUNE_30))
-                .isInstanceOf(CraValidatedException.class);
-        verify(craRepository, never()).save(any());
-    }
-
-    @Test
-    void returnsDtoWithCraMetadata() {
-        MonthlyCraReport cra = draftCra();
-        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
-        when(craRepository.save(cra)).thenReturn(cra);
-
-        CraDetailsDto result = service.validate(CRA_ID, JUNE_30);
-
-        assertThat(result).isNotNull();
-        assertThat(result.id()).isEqualTo(CRA_ID);
-        assertThat(result.month()).isEqualTo(6);
-        assertThat(result.year()).isEqualTo(2026);
-    }
-
-    private MonthlyCraReport draftCra() {
-        MonthlyCraReport cra = mock(MonthlyCraReport.class);
-        when(cra.getId()).thenReturn(CRA_ID);
-        when(cra.getMonth()).thenReturn(6);
-        when(cra.getYear()).thenReturn(2026);
-        when(cra.getStatus()).thenReturn(ValidationStatus.DRAFT);
-        when(cra.getDayEntries()).thenReturn(List.of());
-        return cra;
-    }
-}
diff --git a/backend/target/classes/application.yml b/backend/target/classes/application.yml
index 1ea32aa4..123fe0ab 100644
--- a/backend/target/classes/application.yml
+++ b/backend/target/classes/application.yml
@@ -1,3 +1,15 @@
+spring:
+  datasource:
+    url: jdbc:sqlite:./var/timizer.db
+    driver-class-name: org.sqlite.JDBC
+  jpa:
+    hibernate:
+      ddl-auto: update
+    database-platform: org.hibernate.community.dialect.SQLiteDialect
+    properties:
+      hibernate:
+        globally_quoted_identifiers: true
+    open-in-view: false
 cra:
   defaults:
     provider:
diff --git a/backend/target/classes/com/timizer/backend/cra/CraDetailsMapper$1.class b/backend/target/classes/com/timizer/backend/cra/CraDetailsMapper$1.class
new file mode 100644
index 00000000..77d8addb
Binary files /dev/null and b/backend/target/classes/com/timizer/backend/cra/CraDetailsMapper$1.class differ
diff --git a/backend/target/classes/com/timizer/backend/cra/CraDetailsMapper.class b/backend/target/classes/com/timizer/backend/cra/CraDetailsMapper.class
index 8b8fcc1b..4431446c 100644
Binary files a/backend/target/classes/com/timizer/backend/cra/CraDetailsMapper.class and b/backend/target/classes/com/timizer/backend/cra/CraDetailsMapper.class differ
diff --git a/backend/target/classes/com/timizer/backend/cra/DuplicateCraTransitionException.class b/backend/target/classes/com/timizer/backend/cra/DuplicateCraTransitionException.class
new file mode 100644
index 00000000..8c00bf1c
Binary files /dev/null and b/backend/target/classes/com/timizer/backend/cra/DuplicateCraTransitionException.class differ
diff --git a/backend/target/classes/com/timizer/backend/cra/InvalidCraTransitionException.class b/backend/target/classes/com/timizer/backend/cra/InvalidCraTransitionException.class
new file mode 100644
index 00000000..6f70be7b
Binary files /dev/null and b/backend/target/classes/com/timizer/backend/cra/InvalidCraTransitionException.class differ
diff --git a/backend/target/classes/com/timizer/backend/cra/InvalidWorkValueException.class b/backend/target/classes/com/timizer/backend/cra/InvalidWorkValueException.class
new file mode 100644
index 00000000..55b8268c
Binary files /dev/null and b/backend/target/classes/com/timizer/backend/cra/InvalidWorkValueException.class differ
diff --git a/backend/target/classes/com/timizer/backend/cra/ValidationStatus.class b/backend/target/classes/com/timizer/backend/cra/ValidationStatus.class
index a7eb88ed..9d6d707c 100644
Binary files a/backend/target/classes/com/timizer/backend/cra/ValidationStatus.class and b/backend/target/classes/com/timizer/backend/cra/ValidationStatus.class differ
diff --git a/backend/target/classes/com/timizer/backend/cra/api/CraController.class b/backend/target/classes/com/timizer/backend/cra/api/CraController.class
new file mode 100644
index 00000000..ab0c2c45
Binary files /dev/null and b/backend/target/classes/com/timizer/backend/cra/api/CraController.class differ
diff --git a/backend/target/classes/com/timizer/backend/cra/api/CreateCraRequest.class b/backend/target/classes/com/timizer/backend/cra/api/CreateCraRequest.class
new file mode 100644
index 00000000..b7a190dc
Binary files /dev/null and b/backend/target/classes/com/timizer/backend/cra/api/CreateCraRequest.class differ
diff --git a/backend/target/classes/com/timizerlike/backend/cra/dto/CraCreateOrUpdateRequestDto.class b/backend/target/classes/com/timizerlike/backend/cra/dto/CraCreateOrUpdateRequestDto.class
new file mode 100644
index 00000000..b4b54cc9
Binary files /dev/null and b/backend/target/classes/com/timizerlike/backend/cra/dto/CraCreateOrUpdateRequestDto.class differ
diff --git a/backend/target/classes/com/timizerlike/backend/cra/dto/CraStatus.class b/backend/target/classes/com/timizerlike/backend/cra/dto/CraStatus.class
index af198168..f2d4037c 100644
Binary files a/backend/target/classes/com/timizerlike/backend/cra/dto/CraStatus.class and b/backend/target/classes/com/timizerlike/backend/cra/dto/CraStatus.class differ
diff --git a/backend/target/classes/com/timizerlike/backend/cra/web/CraApiExceptionHandler.class b/backend/target/classes/com/timizerlike/backend/cra/web/CraApiExceptionHandler.class
new file mode 100644
index 00000000..8c45e11d
Binary files /dev/null and b/backend/target/classes/com/timizerlike/backend/cra/web/CraApiExceptionHandler.class differ
diff --git a/backend/target/classes/com/timizerlike/backend/cra/web/CraSignatureController.class b/backend/target/classes/com/timizerlike/backend/cra/web/CraSignatureController.class
new file mode 100644
index 00000000..77b00d77
Binary files /dev/null and b/backend/target/classes/com/timizerlike/backend/cra/web/CraSignatureController.class differ
diff --git a/backend/target/classes/com/timizerlike/backend/cra/web/SignProviderRequestDto.class b/backend/target/classes/com/timizerlike/backend/cra/web/SignProviderRequestDto.class
new file mode 100644
index 00000000..ffbdabdf
Binary files /dev/null and b/backend/target/classes/com/timizerlike/backend/cra/web/SignProviderRequestDto.class differ
diff --git a/backend/target/classes/com/timizerlike/cra/TimizerLikeApplication.class b/backend/target/classes/com/timizerlike/cra/TimizerLikeApplication.class
new file mode 100644
index 00000000..69bc542d
Binary files /dev/null and b/backend/target/classes/com/timizerlike/cra/TimizerLikeApplication.class differ
diff --git a/backend/target/classes/com/timizerlike/cra/pdf/model/package-info.class b/backend/target/classes/com/timizerlike/cra/pdf/model/package-info.class
new file mode 100644
index 00000000..8e67392e
Binary files /dev/null and b/backend/target/classes/com/timizerlike/cra/pdf/model/package-info.class differ
diff --git a/backend/target/classes/com/timizerlike/cra/service/CraDayUpdateService.class b/backend/target/classes/com/timizerlike/cra/service/CraDayUpdateService.class
index b4eec5ef..576ac387 100644
Binary files a/backend/target/classes/com/timizerlike/cra/service/CraDayUpdateService.class and b/backend/target/classes/com/timizerlike/cra/service/CraDayUpdateService.class differ
diff --git a/backend/target/classes/com/timizerlike/cra/service/CraHistoryService.class b/backend/target/classes/com/timizerlike/cra/service/CraHistoryService.class
index 74a45182..254edaa4 100644
Binary files a/backend/target/classes/com/timizerlike/cra/service/CraHistoryService.class and b/backend/target/classes/com/timizerlike/cra/service/CraHistoryService.class differ
diff --git a/backend/target/classes/com/timizerlike/cra/service/CraPdfDownloadService.class b/backend/target/classes/com/timizerlike/cra/service/CraPdfDownloadService.class
index 66bca4e1..cf106eb1 100644
Binary files a/backend/target/classes/com/timizerlike/cra/service/CraPdfDownloadService.class and b/backend/target/classes/com/timizerlike/cra/service/CraPdfDownloadService.class differ
diff --git a/backend/target/classes/com/timizerlike/cra/service/CraSignatureTransitionService.class b/backend/target/classes/com/timizerlike/cra/service/CraSignatureTransitionService.class
new file mode 100644
index 00000000..33f2d09e
Binary files /dev/null and b/backend/target/classes/com/timizerlike/cra/service/CraSignatureTransitionService.class differ
diff --git a/backend/target/maven-status/maven-compiler-plugin/compile/default-compile/createdFiles.lst b/backend/target/maven-status/maven-compiler-plugin/compile/default-compile/createdFiles.lst
index 3c37339f..d74c1ba8 100644
--- a/backend/target/maven-status/maven-compiler-plugin/compile/default-compile/createdFiles.lst
+++ b/backend/target/maven-status/maven-compiler-plugin/compile/default-compile/createdFiles.lst
@@ -1,31 +1,44 @@
 com/timizerlike/cra/pdf/model/CraPdfSignatures.class
 com/timizer/backend/cra/CraTotalCalculationService.class
 com/timizerlike/backend/cra/dto/CraDayEntryDto.class
-com/timizerlike/cra/pdf/model/CraPdfDayType.class
 com/timizer/backend/cra/CraDayEntry.class
-com/timizerlike/backend/cra/dto/CraSummaryDto.class
-com/timizerlike/backend/cra/dto/CraStatus.class
+com/timizerlike/backend/cra/web/CraApiExceptionHandler.class
+com/timizer/backend/cra/api/CreateCraRequest.class
 com/timizerlike/cra/config/CraDefaultsProperties$Provider.class
 com/timizerlike/cra/pdf/model/CraPdfClientSignature.class
+com/timizer/backend/cra/DuplicateCraTransitionException.class
 com/timizer/backend/cra/MonthlyCraCreationService$CraCreationResult.class
+com/timizer/backend/cra/InvalidWorkValueException.class
 com/timizerlike/cra/service/CraHistoryService.class
+com/timizer/backend/cra/CraDetailsMapper$1.class
 com/timizerlike/cra/pdf/model/CraPdfDocument.class
 com/timizerlike/cra/pdf/CraPdfGenerator.class
 com/timizer/backend/cra/MonthlyCraReport.class
-com/timizer/backend/cra/CraDetailsMapper.class
-com/timizerlike/cra/pdf/model/CraPdfProviderSignature.class
+com/timizer/backend/cra/InvalidCraTransitionException.class
 com/timizerlike/backend/cra/web/CraHistoryController.class
-com/timizer/backend/cra/ValidationStatus.class
+com/timizerlike/backend/cra/web/CraSignatureController.class
 com/timizer/backend/cra/MonthlyCraCreationService.class
 com/timizer/backend/cra/MonthlyCraReportRepository.class
 com/timizerlike/cra/pdf/model/CraPdfSummary.class
-com/timizerlike/cra/model/CraMonthlyReport.class
 com/timizerlike/cra/service/CraCreationService.class
-com/timizerlike/cra/config/CraDefaultsProperties$Client.class
 com/timizer/backend/cra/CraNotFoundException.class
-com/timizerlike/cra/pdf/model/CraPdfParty.class
 com/timizerlike/cra/config/CraDefaultsProperties.class
 com/timizerlike/backend/cra/dto/CraDetailsDto.class
 com/timizerlike/cra/pdf/model/CraPdfDayEntry.class
+com/timizerlike/backend/cra/web/SignProviderRequestDto.class
+com/timizerlike/cra/pdf/model/CraPdfDayType.class
+com/timizer/backend/cra/api/CraController.class
+com/timizerlike/backend/cra/dto/CraSummaryDto.class
+com/timizerlike/backend/cra/dto/CraStatus.class
+com/timizerlike/cra/service/CraSignatureTransitionService.class
+com/timizer/backend/cra/CraDetailsMapper.class
+com/timizerlike/cra/pdf/model/CraPdfProviderSignature.class
+com/timizer/backend/cra/ValidationStatus.class
+com/timizerlike/backend/cra/dto/CraCreateOrUpdateRequestDto.class
+com/timizerlike/cra/TimizerLikeApplication.class
+com/timizerlike/cra/model/CraMonthlyReport.class
+com/timizerlike/cra/config/CraDefaultsProperties$Client.class
+com/timizerlike/cra/pdf/model/package-info.class
+com/timizerlike/cra/pdf/model/CraPdfParty.class
 com/timizerlike/cra/config/CraDefaultsProperties$Client$Contact.class
 com/timizerlike/cra/pdf/model/CraPdfContact.class
diff --git a/backend/target/maven-status/maven-compiler-plugin/compile/default-compile/inputFiles.lst b/backend/target/maven-status/maven-compiler-plugin/compile/default-compile/inputFiles.lst
index 6d8121eb..699f32f6 100644
--- a/backend/target/maven-status/maven-compiler-plugin/compile/default-compile/inputFiles.lst
+++ b/backend/target/maven-status/maven-compiler-plugin/compile/default-compile/inputFiles.lst
@@ -1,49 +1,49 @@
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/service/CraPdfDownloadService.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/web/CraHistoryController.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/CraTotalCalculationService.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfClientSignature.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/CraDetailsMapper.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/model/package-info.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/CraNotValidatedException.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/service/CraHistoryService.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/dto/CraDayEntryDto.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfSummary.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfDayType.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/service/CraCreationService.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/MonthlyCraCreationService.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfDayEntry.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/web/CraDayController.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfDocument.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/service/CraPdfDownloadResult.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/CraNotFoundException.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/dto/CraSummaryDto.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/service/CraValidationService.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/api/CraController.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/dto/CraDetailsDto.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfProviderSignature.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/web/CraPdfController.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfSignatures.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/web/ValidateCraRequestDto.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/config/CraDefaultsProperties.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/service/CraDayUpdateService.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/CraDayNotFoundException.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/TimizerLikeApplication.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/dto/CraStatus.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/service/CraPdfAssemblerService.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/web/CraValidationController.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/dto/CraDayUpdateRequestDto.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/model/CraMonthlyReport.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/ValidationStatus.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/dto/CraCreateOrUpdateRequestDto.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/api/CreateCraRequest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfParty.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/CraValidatedException.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/CraDayEntryRepository.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizer/backend/cra/InvalidWorkValueException.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfContact.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T031/backend/src/main/java/com/timizerlike/backend/cra/web/CraPdfDownloadController.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/web/CraDayController.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/InvalidWorkValueException.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/service/CraPdfDownloadResult.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfSummary.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/web/CraSignatureController.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfClientSignature.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/web/CraPdfDownloadController.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfSignatures.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/CraTotalCalculationService.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfDayType.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/TimizerLikeApplication.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/CraDayNotFoundException.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/dto/CraDetailsDto.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/service/CraSignatureTransitionService.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/model/CraMonthlyReport.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/CraNotFoundException.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/dto/CraDayEntryDto.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/CraNotValidatedException.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfParty.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/api/CreateCraRequest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/web/SignProviderRequestDto.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/InvalidCraTransitionException.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfContact.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/dto/CraSummaryDto.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/model/package-info.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/config/CraDefaultsProperties.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/service/CraDayUpdateService.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/dto/CraStatus.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/service/CraPdfDownloadService.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/DuplicateCraTransitionException.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/dto/CraCreateOrUpdateRequestDto.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/service/CraHistoryService.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/ValidationStatus.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/web/CraApiExceptionHandler.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/CraDetailsMapper.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/dto/CraDayUpdateRequestDto.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfProviderSignature.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/backend/cra/web/CraHistoryController.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfDocument.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/CraValidatedException.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/MonthlyCraCreationService.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/pdf/model/CraPdfDayEntry.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizerlike/cra/service/CraCreationService.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/CraDayEntryRepository.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/main/java/com/timizer/backend/cra/api/CraController.java
diff --git a/backend/target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/createdFiles.lst b/backend/target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/createdFiles.lst
index 66178f61..0371b119 100644
--- a/backend/target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/createdFiles.lst
+++ b/backend/target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/createdFiles.lst
@@ -1,18 +1,23 @@
-com/timizer/backend/cra/MonthlyCraReportTest.class
+com/timizerlike/cra/service/CraSignatureTransitionServiceTest.class
 com/timizer/backend/cra/api/CraControllerTest.class
 com/timizerlike/cra/pdf/model/CraPdfDocumentTest.class
-com/timizerlike/backend/cra/integration/CraWorkflowIntegrationTest$2.class
 com/timizer/backend/cra/MonthlyCraReportRepositoryTest.class
 com/timizer/backend/cra/MonthlyCraCreationServiceTest.class
 com/timizerlike/cra/service/CraCreationServiceTest.class
-com/timizerlike/cra/service/CraValidationServiceTest.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest$5.class
 com/timizer/backend/cra/CraDayEntryTest.class
-com/timizerlike/backend/cra/integration/CraWorkflowIntegrationTest$3.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest$8.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest$3.class
+com/timizer/backend/cra/MonthlyCraReportTest.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest$6.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest$4.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest$1.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest$9.class
 com/timizer/backend/cra/JpaTestConfig.class
 com/timizerlike/backend/cra/dto/CraDtoTest.class
-com/timizerlike/backend/cra/integration/CraWorkflowIntegrationTest.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest$2.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest.class
 com/timizerlike/cra/pdf/CraPdfGeneratorTest.class
-com/timizerlike/backend/cra/integration/CraWorkflowIntegrationTest$4.class
-com/timizerlike/backend/cra/web/CraValidationControllerTest.class
-com/timizerlike/backend/cra/integration/CraWorkflowIntegrationTest$1.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest$10.class
+com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest$7.class
 com/timizer/backend/cra/MonthlyCraReportPersistenceTest.class
diff --git a/backend/target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/inputFiles.lst b/backend/target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/inputFiles.lst
index 59364b2a..13a61ed6 100644
--- a/backend/target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/inputFiles.lst
+++ b/backend/target/maven-status/maven-compiler-plugin/testCompile/default-testCompile/inputFiles.lst
@@ -1,19 +1,22 @@
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizer/backend/cra/JpaTestConfig.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizer/backend/cra/MonthlyCraCreationServiceTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizerlike/backend/cra/integration/CraWorkflowIntegrationTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizerlike/backend/cra/web/CraDayControllerTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizer/backend/cra/CraDayEntryUpdateWorkValueTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizerlike/backend/cra/web/CraValidationControllerTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizerlike/cra/pdf/model/CraPdfDocumentTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizerlike/TimizerlikeTestConfig.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizer/backend/cra/CraTotalCalculationServiceTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizer/backend/cra/CraDayEntryTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizerlike/backend/cra/dto/CraDtoTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportPersistenceTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizerlike/cra/service/CraValidationServiceTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizerlike/cra/service/CraDayUpdateServiceTest.java
-/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/src/test/java/com/timizerlike/cra/service/CraCreationServiceTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/backend/cra/web/CraPdfDownloadControllerTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/cra/service/CraPdfDownloadServiceTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizer/backend/cra/JpaTestConfig.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizer/backend/cra/CraTotalCalculationServiceTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportPersistenceTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/cra/pdf/model/CraPdfDocumentTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizer/backend/cra/MonthlyCraCreationServiceTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizer/backend/cra/CraDayEntryTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/backend/cra/dto/CraDtoTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/TimizerlikeTestConfig.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/backend/cra/web/CraHistoryControllerTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/backend/cra/integration/CraSignatureWorkflowIntegrationTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/cra/service/CraCreationServiceTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/cra/service/CraHistoryServiceTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/cra/service/CraSignatureTransitionServiceTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/backend/cra/web/CraDayControllerTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizerlike/cra/service/CraDayUpdateServiceTest.java
+/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/src/test/java/com/timizer/backend/cra/CraDayEntryUpdateWorkValueTest.java
diff --git a/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraDayEntryTest.xml b/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraDayEntryTest.xml
index cc3596b0..e0348994 100644
--- a/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraDayEntryTest.xml
+++ b/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraDayEntryTest.xml
@@ -1,9 +1,9 @@
 <?xml version="1.0" encoding="UTF-8"?>
-<testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report-3.0.xsd" version="3.0" name="com.timizer.backend.cra.CraDayEntryTest" time="0.007" tests="16" errors="0" skipped="0" failures="0">
+<testsuite xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="https://maven.apache.org/surefire/maven-surefire-plugin/xsd/surefire-test-report-3.0.xsd" version="3.0" name="com.timizer.backend.cra.CraDayEntryTest" time="0.009" tests="16" errors="0" skipped="0" failures="0">
   <properties>
     <property name="java.specification.version" value="26"/>
     <property name="sun.jnu.encoding" value="UTF-8"/>
-    <property name="java.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/test-classes:/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/classes:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter/3.2.5/spring-boot-starter-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot/3.2.5/spring-boot-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-context/6.1.6/spring-context-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-autoconfigure/3.2.5/spring-boot-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-logging/3.2.5/spring-boot-starter-logging-3.2.5.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-classic/1.4.14/logback-classic-1.4.14.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-core/1.4.14/logback-core-1.4.14.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-to-slf4j/2.21.1/log4j-to-slf4j-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-api/2.21.1/log4j-api-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/jul-to-slf4j/2.0.13/jul-to-slf4j-2.0.13.jar:/Users/pierrebocquet/.m2/repository/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-core/6.1.6/spring-core-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jcl/6.1.6/spring-jcl-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.2.5/spring-boot-starter-web-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-json/3.2.5/spring-boot-starter-json-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.15.4/jackson-databind-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.4/jackson-annotations-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.15.4/jackson-core-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.15.4/jackson-datatype-jdk8-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.15.4/jackson-datatype-jsr310-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/module/jackson-module-parameter-names/2.15.4/jackson-module-parameter-names-2.15.4.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-tomcat/3.2.5/spring-boot-starter-tomcat-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-core/10.1.20/tomcat-embed-core-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.20/tomcat-embed-websocket-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-web/6.1.6/spring-web-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-beans/6.1.6/spring-beans-6.1.6.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-observation/1.12.5/micrometer-observation-1.12.5.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-commons/1.12.5/micrometer-commons-1.12.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-webmvc/6.1.6/spring-webmvc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aop/6.1.6/spring-aop-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-expression/6.1.6/spring-expression-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-data-jpa/3.2.5/spring-boot-starter-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-aop/3.2.5/spring-boot-starter-aop-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/aspectj/aspectjweaver/1.9.22/aspectjweaver-1.9.22.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-jdbc/3.2.5/spring-boot-starter-jdbc-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/zaxxer/HikariCP/5.0.1/HikariCP-5.0.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jdbc/6.1.6/spring-jdbc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-core/6.4.4.Final/hibernate-core-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/jboss/logging/jboss-logging/3.5.3.Final/jboss-logging-3.5.3.Final.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/common/hibernate-commons-annotations/6.0.6.Final/hibernate-commons-annotations-6.0.6.Final.jar:/Users/pierrebocquet/.m2/repository/io/smallrye/jandex/3.1.2/jandex-3.1.2.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/classmate/1.6.0/classmate-1.6.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy/1.14.13/byte-buddy-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar:/Users/pierrebocquet/.m2/repository/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-jpa/3.2.5/spring-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-commons/3.2.5/spring-data-commons-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-orm/6.1.6/spring-orm-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-tx/6.1.6/spring-tx-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aspects/6.1.6/spring-aspects-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-validation/3.2.5/spring-boot-starter-validation-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.20/tomcat-embed-el-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/validator/hibernate-validator/8.0.1.Final/hibernate-validator-8.0.1.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar:/Users/pierrebocquet/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox/3.0.3/pdfbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox-io/3.0.3/pdfbox-io-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/fontbox/3.0.3/fontbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/commons-logging/commons-logging/1.3.3/commons-logging-1.3.3.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-test/3.2.5/spring-boot-starter-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test/3.2.5/spring-boot-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test-autoconfigure/3.2.5/spring-boot-test-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar:/Users/pierrebocquet/.m2/repository/net/minidev/json-smart/2.5.1/json-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/net/minidev/accessors-smart/2.5.1/accessors-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/org/ow2/asm/asm/9.6/asm-9.6.jar:/Users/pierrebocquet/.m2/repository/org/assertj/assertj-core/3.24.2/assertj-core-3.24.2.jar:/Users/pierrebocquet/.m2/repository/org/awaitility/awaitility/4.2.1/awaitility-4.2.1.jar:/Users/pierrebocquet/.m2/repository/org/hamcrest/hamcrest/2.2/hamcrest-2.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter/5.10.2/junit-jupiter-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-api/5.10.2/junit-jupiter-api-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-commons/1.10.2/junit-platform-commons-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-params/5.10.2/junit-jupiter-params-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-engine/5.10.2/junit-jupiter-engine-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-engine/1.10.2/junit-platform-engine-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-core/5.7.0/mockito-core-5.7.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.13/byte-buddy-agent-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/objenesis/objenesis/3.3/objenesis-3.3.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-junit-jupiter/5.7.0/mockito-junit-jupiter-5.7.0.jar:/Users/pierrebocquet/.m2/repository/org/skyscreamer/jsonassert/1.5.1/jsonassert-1.5.1.jar:/Users/pierrebocquet/.m2/repository/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-test/6.1.6/spring-test-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/xmlunit/xmlunit-core/2.9.1/xmlunit-core-2.9.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/client5/httpclient5/5.2.3/httpclient5-5.2.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5/5.2.4/httpcore5-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5-h2/5.2.4/httpcore5-h2-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar:"/>
+    <property name="java.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/test-classes:/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/classes:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter/3.2.5/spring-boot-starter-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot/3.2.5/spring-boot-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-context/6.1.6/spring-context-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-autoconfigure/3.2.5/spring-boot-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-logging/3.2.5/spring-boot-starter-logging-3.2.5.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-classic/1.4.14/logback-classic-1.4.14.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-core/1.4.14/logback-core-1.4.14.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-to-slf4j/2.21.1/log4j-to-slf4j-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-api/2.21.1/log4j-api-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/jul-to-slf4j/2.0.13/jul-to-slf4j-2.0.13.jar:/Users/pierrebocquet/.m2/repository/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-core/6.1.6/spring-core-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jcl/6.1.6/spring-jcl-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.2.5/spring-boot-starter-web-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-json/3.2.5/spring-boot-starter-json-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.15.4/jackson-databind-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.4/jackson-annotations-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.15.4/jackson-core-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.15.4/jackson-datatype-jdk8-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.15.4/jackson-datatype-jsr310-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/module/jackson-module-parameter-names/2.15.4/jackson-module-parameter-names-2.15.4.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-tomcat/3.2.5/spring-boot-starter-tomcat-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-core/10.1.20/tomcat-embed-core-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.20/tomcat-embed-websocket-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-web/6.1.6/spring-web-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-beans/6.1.6/spring-beans-6.1.6.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-observation/1.12.5/micrometer-observation-1.12.5.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-commons/1.12.5/micrometer-commons-1.12.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-webmvc/6.1.6/spring-webmvc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aop/6.1.6/spring-aop-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-expression/6.1.6/spring-expression-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-data-jpa/3.2.5/spring-boot-starter-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-aop/3.2.5/spring-boot-starter-aop-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/aspectj/aspectjweaver/1.9.22/aspectjweaver-1.9.22.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-jdbc/3.2.5/spring-boot-starter-jdbc-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/zaxxer/HikariCP/5.0.1/HikariCP-5.0.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jdbc/6.1.6/spring-jdbc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-core/6.4.4.Final/hibernate-core-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/common/hibernate-commons-annotations/6.0.6.Final/hibernate-commons-annotations-6.0.6.Final.jar:/Users/pierrebocquet/.m2/repository/io/smallrye/jandex/3.1.2/jandex-3.1.2.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/classmate/1.6.0/classmate-1.6.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy/1.14.13/byte-buddy-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar:/Users/pierrebocquet/.m2/repository/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-jpa/3.2.5/spring-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-commons/3.2.5/spring-data-commons-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-orm/6.1.6/spring-orm-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-tx/6.1.6/spring-tx-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aspects/6.1.6/spring-aspects-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-validation/3.2.5/spring-boot-starter-validation-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.20/tomcat-embed-el-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/validator/hibernate-validator/8.0.1.Final/hibernate-validator-8.0.1.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar:/Users/pierrebocquet/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar:/Users/pierrebocquet/.m2/repository/org/xerial/sqlite-jdbc/3.49.1.0/sqlite-jdbc-3.49.1.0.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-community-dialects/6.4.4.Final/hibernate-community-dialects-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/org/jboss/logging/jboss-logging/3.5.3.Final/jboss-logging-3.5.3.Final.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox/3.0.3/pdfbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox-io/3.0.3/pdfbox-io-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/fontbox/3.0.3/fontbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/commons-logging/commons-logging/1.3.3/commons-logging-1.3.3.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-test/3.2.5/spring-boot-starter-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test/3.2.5/spring-boot-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test-autoconfigure/3.2.5/spring-boot-test-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar:/Users/pierrebocquet/.m2/repository/net/minidev/json-smart/2.5.1/json-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/net/minidev/accessors-smart/2.5.1/accessors-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/org/ow2/asm/asm/9.6/asm-9.6.jar:/Users/pierrebocquet/.m2/repository/org/assertj/assertj-core/3.24.2/assertj-core-3.24.2.jar:/Users/pierrebocquet/.m2/repository/org/awaitility/awaitility/4.2.1/awaitility-4.2.1.jar:/Users/pierrebocquet/.m2/repository/org/hamcrest/hamcrest/2.2/hamcrest-2.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter/5.10.2/junit-jupiter-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-api/5.10.2/junit-jupiter-api-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-commons/1.10.2/junit-platform-commons-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-params/5.10.2/junit-jupiter-params-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-engine/5.10.2/junit-jupiter-engine-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-engine/1.10.2/junit-platform-engine-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-core/5.7.0/mockito-core-5.7.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.13/byte-buddy-agent-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/objenesis/objenesis/3.3/objenesis-3.3.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-junit-jupiter/5.7.0/mockito-junit-jupiter-5.7.0.jar:/Users/pierrebocquet/.m2/repository/org/skyscreamer/jsonassert/1.5.1/jsonassert-1.5.1.jar:/Users/pierrebocquet/.m2/repository/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-test/6.1.6/spring-test-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/xmlunit/xmlunit-core/2.9.1/xmlunit-core-2.9.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/client5/httpclient5/5.2.3/httpclient5-5.2.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5/5.2.4/httpcore5-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5-h2/5.2.4/httpcore5-h2-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar:"/>
     <property name="java.vm.vendor" value="Homebrew"/>
     <property name="sun.arch.data.model" value="64"/>
     <property name="net.bytebuddy.experimental" value="true"/>
@@ -16,10 +16,10 @@
     <property name="sun.java.launcher" value="SUN_STANDARD"/>
     <property name="user.country" value="FR"/>
     <property name="sun.boot.library.path" value="/opt/homebrew/Cellar/openjdk/26.0.1/libexec/openjdk.jdk/Contents/Home/lib"/>
-    <property name="sun.java.command" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/surefire/surefirebooter-20260712111320828_3.jar /Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/surefire 2026-07-12T11-13-20_799-jvmRun1 surefire-20260712111320828_1tmp surefire_0-20260712111320828_2tmp"/>
+    <property name="sun.java.command" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/surefire/surefirebooter-20260728125424722_3.jar /Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/surefire 2026-07-28T12-54-24_693-jvmRun1 surefire-20260728125424722_1tmp surefire_0-20260728125424722_2tmp"/>
     <property name="http.nonProxyHosts" value="local|*.local|169.254/16|*.169.254/16"/>
     <property name="jdk.debug" value="release"/>
-    <property name="surefire.test.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/test-classes:/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/classes:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter/3.2.5/spring-boot-starter-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot/3.2.5/spring-boot-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-context/6.1.6/spring-context-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-autoconfigure/3.2.5/spring-boot-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-logging/3.2.5/spring-boot-starter-logging-3.2.5.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-classic/1.4.14/logback-classic-1.4.14.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-core/1.4.14/logback-core-1.4.14.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-to-slf4j/2.21.1/log4j-to-slf4j-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-api/2.21.1/log4j-api-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/jul-to-slf4j/2.0.13/jul-to-slf4j-2.0.13.jar:/Users/pierrebocquet/.m2/repository/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-core/6.1.6/spring-core-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jcl/6.1.6/spring-jcl-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.2.5/spring-boot-starter-web-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-json/3.2.5/spring-boot-starter-json-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.15.4/jackson-databind-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.4/jackson-annotations-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.15.4/jackson-core-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.15.4/jackson-datatype-jdk8-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.15.4/jackson-datatype-jsr310-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/module/jackson-module-parameter-names/2.15.4/jackson-module-parameter-names-2.15.4.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-tomcat/3.2.5/spring-boot-starter-tomcat-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-core/10.1.20/tomcat-embed-core-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.20/tomcat-embed-websocket-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-web/6.1.6/spring-web-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-beans/6.1.6/spring-beans-6.1.6.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-observation/1.12.5/micrometer-observation-1.12.5.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-commons/1.12.5/micrometer-commons-1.12.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-webmvc/6.1.6/spring-webmvc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aop/6.1.6/spring-aop-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-expression/6.1.6/spring-expression-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-data-jpa/3.2.5/spring-boot-starter-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-aop/3.2.5/spring-boot-starter-aop-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/aspectj/aspectjweaver/1.9.22/aspectjweaver-1.9.22.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-jdbc/3.2.5/spring-boot-starter-jdbc-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/zaxxer/HikariCP/5.0.1/HikariCP-5.0.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jdbc/6.1.6/spring-jdbc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-core/6.4.4.Final/hibernate-core-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/jboss/logging/jboss-logging/3.5.3.Final/jboss-logging-3.5.3.Final.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/common/hibernate-commons-annotations/6.0.6.Final/hibernate-commons-annotations-6.0.6.Final.jar:/Users/pierrebocquet/.m2/repository/io/smallrye/jandex/3.1.2/jandex-3.1.2.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/classmate/1.6.0/classmate-1.6.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy/1.14.13/byte-buddy-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar:/Users/pierrebocquet/.m2/repository/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-jpa/3.2.5/spring-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-commons/3.2.5/spring-data-commons-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-orm/6.1.6/spring-orm-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-tx/6.1.6/spring-tx-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aspects/6.1.6/spring-aspects-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-validation/3.2.5/spring-boot-starter-validation-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.20/tomcat-embed-el-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/validator/hibernate-validator/8.0.1.Final/hibernate-validator-8.0.1.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar:/Users/pierrebocquet/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox/3.0.3/pdfbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox-io/3.0.3/pdfbox-io-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/fontbox/3.0.3/fontbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/commons-logging/commons-logging/1.3.3/commons-logging-1.3.3.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-test/3.2.5/spring-boot-starter-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test/3.2.5/spring-boot-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test-autoconfigure/3.2.5/spring-boot-test-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar:/Users/pierrebocquet/.m2/repository/net/minidev/json-smart/2.5.1/json-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/net/minidev/accessors-smart/2.5.1/accessors-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/org/ow2/asm/asm/9.6/asm-9.6.jar:/Users/pierrebocquet/.m2/repository/org/assertj/assertj-core/3.24.2/assertj-core-3.24.2.jar:/Users/pierrebocquet/.m2/repository/org/awaitility/awaitility/4.2.1/awaitility-4.2.1.jar:/Users/pierrebocquet/.m2/repository/org/hamcrest/hamcrest/2.2/hamcrest-2.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter/5.10.2/junit-jupiter-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-api/5.10.2/junit-jupiter-api-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-commons/1.10.2/junit-platform-commons-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-params/5.10.2/junit-jupiter-params-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-engine/5.10.2/junit-jupiter-engine-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-engine/1.10.2/junit-platform-engine-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-core/5.7.0/mockito-core-5.7.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.13/byte-buddy-agent-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/objenesis/objenesis/3.3/objenesis-3.3.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-junit-jupiter/5.7.0/mockito-junit-jupiter-5.7.0.jar:/Users/pierrebocquet/.m2/repository/org/skyscreamer/jsonassert/1.5.1/jsonassert-1.5.1.jar:/Users/pierrebocquet/.m2/repository/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-test/6.1.6/spring-test-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/xmlunit/xmlunit-core/2.9.1/xmlunit-core-2.9.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/client5/httpclient5/5.2.3/httpclient5-5.2.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5/5.2.4/httpcore5-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5-h2/5.2.4/httpcore5-h2-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar:"/>
+    <property name="surefire.test.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/test-classes:/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/classes:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter/3.2.5/spring-boot-starter-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot/3.2.5/spring-boot-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-context/6.1.6/spring-context-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-autoconfigure/3.2.5/spring-boot-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-logging/3.2.5/spring-boot-starter-logging-3.2.5.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-classic/1.4.14/logback-classic-1.4.14.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-core/1.4.14/logback-core-1.4.14.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-to-slf4j/2.21.1/log4j-to-slf4j-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-api/2.21.1/log4j-api-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/jul-to-slf4j/2.0.13/jul-to-slf4j-2.0.13.jar:/Users/pierrebocquet/.m2/repository/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-core/6.1.6/spring-core-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jcl/6.1.6/spring-jcl-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.2.5/spring-boot-starter-web-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-json/3.2.5/spring-boot-starter-json-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.15.4/jackson-databind-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.4/jackson-annotations-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.15.4/jackson-core-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.15.4/jackson-datatype-jdk8-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.15.4/jackson-datatype-jsr310-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/module/jackson-module-parameter-names/2.15.4/jackson-module-parameter-names-2.15.4.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-tomcat/3.2.5/spring-boot-starter-tomcat-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-core/10.1.20/tomcat-embed-core-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.20/tomcat-embed-websocket-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-web/6.1.6/spring-web-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-beans/6.1.6/spring-beans-6.1.6.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-observation/1.12.5/micrometer-observation-1.12.5.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-commons/1.12.5/micrometer-commons-1.12.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-webmvc/6.1.6/spring-webmvc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aop/6.1.6/spring-aop-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-expression/6.1.6/spring-expression-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-data-jpa/3.2.5/spring-boot-starter-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-aop/3.2.5/spring-boot-starter-aop-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/aspectj/aspectjweaver/1.9.22/aspectjweaver-1.9.22.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-jdbc/3.2.5/spring-boot-starter-jdbc-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/zaxxer/HikariCP/5.0.1/HikariCP-5.0.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jdbc/6.1.6/spring-jdbc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-core/6.4.4.Final/hibernate-core-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/common/hibernate-commons-annotations/6.0.6.Final/hibernate-commons-annotations-6.0.6.Final.jar:/Users/pierrebocquet/.m2/repository/io/smallrye/jandex/3.1.2/jandex-3.1.2.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/classmate/1.6.0/classmate-1.6.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy/1.14.13/byte-buddy-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar:/Users/pierrebocquet/.m2/repository/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-jpa/3.2.5/spring-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-commons/3.2.5/spring-data-commons-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-orm/6.1.6/spring-orm-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-tx/6.1.6/spring-tx-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aspects/6.1.6/spring-aspects-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-validation/3.2.5/spring-boot-starter-validation-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.20/tomcat-embed-el-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/validator/hibernate-validator/8.0.1.Final/hibernate-validator-8.0.1.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar:/Users/pierrebocquet/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar:/Users/pierrebocquet/.m2/repository/org/xerial/sqlite-jdbc/3.49.1.0/sqlite-jdbc-3.49.1.0.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-community-dialects/6.4.4.Final/hibernate-community-dialects-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/org/jboss/logging/jboss-logging/3.5.3.Final/jboss-logging-3.5.3.Final.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox/3.0.3/pdfbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox-io/3.0.3/pdfbox-io-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/fontbox/3.0.3/fontbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/commons-logging/commons-logging/1.3.3/commons-logging-1.3.3.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-test/3.2.5/spring-boot-starter-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test/3.2.5/spring-boot-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test-autoconfigure/3.2.5/spring-boot-test-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar:/Users/pierrebocquet/.m2/repository/net/minidev/json-smart/2.5.1/json-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/net/minidev/accessors-smart/2.5.1/accessors-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/org/ow2/asm/asm/9.6/asm-9.6.jar:/Users/pierrebocquet/.m2/repository/org/assertj/assertj-core/3.24.2/assertj-core-3.24.2.jar:/Users/pierrebocquet/.m2/repository/org/awaitility/awaitility/4.2.1/awaitility-4.2.1.jar:/Users/pierrebocquet/.m2/repository/org/hamcrest/hamcrest/2.2/hamcrest-2.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter/5.10.2/junit-jupiter-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-api/5.10.2/junit-jupiter-api-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-commons/1.10.2/junit-platform-commons-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-params/5.10.2/junit-jupiter-params-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-engine/5.10.2/junit-jupiter-engine-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-engine/1.10.2/junit-platform-engine-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-core/5.7.0/mockito-core-5.7.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.13/byte-buddy-agent-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/objenesis/objenesis/3.3/objenesis-3.3.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-junit-jupiter/5.7.0/mockito-junit-jupiter-5.7.0.jar:/Users/pierrebocquet/.m2/repository/org/skyscreamer/jsonassert/1.5.1/jsonassert-1.5.1.jar:/Users/pierrebocquet/.m2/repository/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-test/6.1.6/spring-test-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/xmlunit/xmlunit-core/2.9.1/xmlunit-core-2.9.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/client5/httpclient5/5.2.3/httpclient5-5.2.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5/5.2.4/httpcore5-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5-h2/5.2.4/httpcore5-h2-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar:"/>
     <property name="sun.cpu.endian" value="little"/>
     <property name="user.home" value="/Users/pierrebocquet"/>
     <property name="user.language" value="fr"/>
@@ -27,7 +27,7 @@
     <property name="java.version.date" value="2026-04-21"/>
     <property name="java.home" value="/opt/homebrew/Cellar/openjdk/26.0.1/libexec/openjdk.jdk/Contents/Home"/>
     <property name="file.separator" value="/"/>
-    <property name="basedir" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend"/>
+    <property name="basedir" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend"/>
     <property name="java.vm.compressedOopsMode" value="Non-zero disjoint base"/>
     <property name="line.separator" value="&#10;"/>
     <property name="java.vm.specification.vendor" value="Oracle Corporation"/>
@@ -35,7 +35,7 @@
     <property name="FILE_LOG_CHARSET" value="UTF-8"/>
     <property name="java.awt.headless" value="true"/>
     <property name="apple.awt.application.name" value="ForkedBooter"/>
-    <property name="surefire.real.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/surefire/surefirebooter-20260712111320828_3.jar"/>
+    <property name="surefire.real.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/surefire/surefirebooter-20260728125424722_3.jar"/>
     <property name="sun.management.compiler" value="HotSpot 64-Bit Tiered Compilers"/>
     <property name="ftp.nonProxyHosts" value="local|*.local|169.254/16|*.169.254/16"/>
     <property name="java.runtime.version" value="26.0.1"/>
@@ -50,15 +50,15 @@
     <property name="localRepository" value="/Users/pierrebocquet/.m2/repository"/>
     <property name="java.vendor.url.bug" value="https://github.com/Homebrew/homebrew-core/issues"/>
     <property name="java.io.tmpdir" value="/var/folders/0g/xf7sr5893d980r0nztgck6680000gn/T/"/>
-    <property name="catalina.home" value="/private/var/folders/0g/xf7sr5893d980r0nztgck6680000gn/T/tomcat.0.13734993551027570300"/>
+    <property name="catalina.home" value="/private/var/folders/0g/xf7sr5893d980r0nztgck6680000gn/T/tomcat.0.4353836576691429087"/>
     <property name="com.zaxxer.hikari.pool_number" value="1"/>
     <property name="java.version" value="26.0.1"/>
-    <property name="user.dir" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend"/>
+    <property name="user.dir" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend"/>
     <property name="os.arch" value="aarch64"/>
     <property name="java.vm.specification.name" value="Java Virtual Machine Specification"/>
-    <property name="PID" value="77839"/>
+    <property name="PID" value="88176"/>
     <property name="CONSOLE_LOG_CHARSET" value="UTF-8"/>
-    <property name="catalina.base" value="/private/var/folders/0g/xf7sr5893d980r0nztgck6680000gn/T/tomcat.0.13734993551027570300"/>
+    <property name="catalina.base" value="/private/var/folders/0g/xf7sr5893d980r0nztgck6680000gn/T/tomcat.0.4353836576691429087"/>
     <property name="native.encoding" value="UTF-8"/>
     <property name="java.library.path" value="/Users/pierrebocquet/Library/Java/Extensions:/Library/Java/Extensions:/Network/Library/Java/Extensions:/System/Library/Java/Extensions:/usr/lib/java:."/>
     <property name="java.vm.info" value="mixed mode, sharing"/>
@@ -71,19 +71,19 @@
     <property name="java.class.version" value="70.0"/>
   </properties>
   <testcase name="rejectsNegativeWorkValue" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
-  <testcase name="beanValidationAcceptsValidEntry" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.003"/>
-  <testcase name="rejectsNullMonthlyCraId" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.001"/>
-  <testcase name="acceptsNullNote" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
+  <testcase name="beanValidationAcceptsValidEntry" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.004"/>
+  <testcase name="rejectsNullMonthlyCraId" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
+  <testcase name="acceptsNullNote" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.001"/>
   <testcase name="rejectsNaNWorkValue" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
   <testcase name="rejectsInfiniteWorkValue" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
-  <testcase name="constructsWithWorkValueFull" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.001"/>
+  <testcase name="constructsWithWorkValueFull" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
   <testcase name="constructsWithWorkValueHalf" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
   <testcase name="constructsWithWorkValueZero" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
-  <testcase name="storesMonthlyCraIdLink" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
+  <testcase name="storesMonthlyCraIdLink" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.001"/>
   <testcase name="preservesProvidedNoteVerbatim" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
   <testcase name="rejectsDisallowedFractionalWorkValue" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
-  <testcase name="invalidWorkValueExceptionCarriesRejectedValue" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
+  <testcase name="invalidWorkValueExceptionCarriesRejectedValue" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.001"/>
   <testcase name="rejectsWorkValueAboveOne" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
   <testcase name="rejectsNullDate" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
-  <testcase name="acceptsEmptyNote" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.001"/>
+  <testcase name="acceptsEmptyNote" classname="com.timizer.backend.cra.CraDayEntryTest" time="0.0"/>
 </testsuite>
\ No newline at end of file
diff --git a/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest.xml b/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest.xml
index 05d874f0..93421765 100644
--- a/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest.xml
+++ b/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest.xml
@@ -3,7 +3,7 @@
   <properties>
     <property name="java.specification.version" value="26"/>
     <property name="sun.jnu.encoding" value="UTF-8"/>
-    <property name="java.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/test-classes:/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/classes:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter/3.2.5/spring-boot-starter-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot/3.2.5/spring-boot-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-context/6.1.6/spring-context-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-autoconfigure/3.2.5/spring-boot-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-logging/3.2.5/spring-boot-starter-logging-3.2.5.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-classic/1.4.14/logback-classic-1.4.14.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-core/1.4.14/logback-core-1.4.14.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-to-slf4j/2.21.1/log4j-to-slf4j-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-api/2.21.1/log4j-api-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/jul-to-slf4j/2.0.13/jul-to-slf4j-2.0.13.jar:/Users/pierrebocquet/.m2/repository/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-core/6.1.6/spring-core-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jcl/6.1.6/spring-jcl-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.2.5/spring-boot-starter-web-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-json/3.2.5/spring-boot-starter-json-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.15.4/jackson-databind-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.4/jackson-annotations-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.15.4/jackson-core-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.15.4/jackson-datatype-jdk8-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.15.4/jackson-datatype-jsr310-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/module/jackson-module-parameter-names/2.15.4/jackson-module-parameter-names-2.15.4.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-tomcat/3.2.5/spring-boot-starter-tomcat-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-core/10.1.20/tomcat-embed-core-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.20/tomcat-embed-websocket-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-web/6.1.6/spring-web-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-beans/6.1.6/spring-beans-6.1.6.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-observation/1.12.5/micrometer-observation-1.12.5.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-commons/1.12.5/micrometer-commons-1.12.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-webmvc/6.1.6/spring-webmvc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aop/6.1.6/spring-aop-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-expression/6.1.6/spring-expression-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-data-jpa/3.2.5/spring-boot-starter-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-aop/3.2.5/spring-boot-starter-aop-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/aspectj/aspectjweaver/1.9.22/aspectjweaver-1.9.22.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-jdbc/3.2.5/spring-boot-starter-jdbc-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/zaxxer/HikariCP/5.0.1/HikariCP-5.0.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jdbc/6.1.6/spring-jdbc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-core/6.4.4.Final/hibernate-core-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/jboss/logging/jboss-logging/3.5.3.Final/jboss-logging-3.5.3.Final.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/common/hibernate-commons-annotations/6.0.6.Final/hibernate-commons-annotations-6.0.6.Final.jar:/Users/pierrebocquet/.m2/repository/io/smallrye/jandex/3.1.2/jandex-3.1.2.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/classmate/1.6.0/classmate-1.6.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy/1.14.13/byte-buddy-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar:/Users/pierrebocquet/.m2/repository/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-jpa/3.2.5/spring-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-commons/3.2.5/spring-data-commons-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-orm/6.1.6/spring-orm-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-tx/6.1.6/spring-tx-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aspects/6.1.6/spring-aspects-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-validation/3.2.5/spring-boot-starter-validation-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.20/tomcat-embed-el-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/validator/hibernate-validator/8.0.1.Final/hibernate-validator-8.0.1.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar:/Users/pierrebocquet/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox/3.0.3/pdfbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox-io/3.0.3/pdfbox-io-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/fontbox/3.0.3/fontbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/commons-logging/commons-logging/1.3.3/commons-logging-1.3.3.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-test/3.2.5/spring-boot-starter-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test/3.2.5/spring-boot-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test-autoconfigure/3.2.5/spring-boot-test-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar:/Users/pierrebocquet/.m2/repository/net/minidev/json-smart/2.5.1/json-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/net/minidev/accessors-smart/2.5.1/accessors-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/org/ow2/asm/asm/9.6/asm-9.6.jar:/Users/pierrebocquet/.m2/repository/org/assertj/assertj-core/3.24.2/assertj-core-3.24.2.jar:/Users/pierrebocquet/.m2/repository/org/awaitility/awaitility/4.2.1/awaitility-4.2.1.jar:/Users/pierrebocquet/.m2/repository/org/hamcrest/hamcrest/2.2/hamcrest-2.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter/5.10.2/junit-jupiter-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-api/5.10.2/junit-jupiter-api-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-commons/1.10.2/junit-platform-commons-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-params/5.10.2/junit-jupiter-params-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-engine/5.10.2/junit-jupiter-engine-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-engine/1.10.2/junit-platform-engine-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-core/5.7.0/mockito-core-5.7.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.13/byte-buddy-agent-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/objenesis/objenesis/3.3/objenesis-3.3.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-junit-jupiter/5.7.0/mockito-junit-jupiter-5.7.0.jar:/Users/pierrebocquet/.m2/repository/org/skyscreamer/jsonassert/1.5.1/jsonassert-1.5.1.jar:/Users/pierrebocquet/.m2/repository/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-test/6.1.6/spring-test-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/xmlunit/xmlunit-core/2.9.1/xmlunit-core-2.9.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/client5/httpclient5/5.2.3/httpclient5-5.2.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5/5.2.4/httpcore5-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5-h2/5.2.4/httpcore5-h2-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar:"/>
+    <property name="java.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/test-classes:/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/classes:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter/3.2.5/spring-boot-starter-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot/3.2.5/spring-boot-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-context/6.1.6/spring-context-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-autoconfigure/3.2.5/spring-boot-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-logging/3.2.5/spring-boot-starter-logging-3.2.5.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-classic/1.4.14/logback-classic-1.4.14.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-core/1.4.14/logback-core-1.4.14.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-to-slf4j/2.21.1/log4j-to-slf4j-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-api/2.21.1/log4j-api-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/jul-to-slf4j/2.0.13/jul-to-slf4j-2.0.13.jar:/Users/pierrebocquet/.m2/repository/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-core/6.1.6/spring-core-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jcl/6.1.6/spring-jcl-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.2.5/spring-boot-starter-web-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-json/3.2.5/spring-boot-starter-json-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.15.4/jackson-databind-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.4/jackson-annotations-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.15.4/jackson-core-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.15.4/jackson-datatype-jdk8-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.15.4/jackson-datatype-jsr310-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/module/jackson-module-parameter-names/2.15.4/jackson-module-parameter-names-2.15.4.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-tomcat/3.2.5/spring-boot-starter-tomcat-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-core/10.1.20/tomcat-embed-core-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.20/tomcat-embed-websocket-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-web/6.1.6/spring-web-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-beans/6.1.6/spring-beans-6.1.6.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-observation/1.12.5/micrometer-observation-1.12.5.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-commons/1.12.5/micrometer-commons-1.12.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-webmvc/6.1.6/spring-webmvc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aop/6.1.6/spring-aop-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-expression/6.1.6/spring-expression-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-data-jpa/3.2.5/spring-boot-starter-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-aop/3.2.5/spring-boot-starter-aop-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/aspectj/aspectjweaver/1.9.22/aspectjweaver-1.9.22.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-jdbc/3.2.5/spring-boot-starter-jdbc-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/zaxxer/HikariCP/5.0.1/HikariCP-5.0.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jdbc/6.1.6/spring-jdbc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-core/6.4.4.Final/hibernate-core-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/common/hibernate-commons-annotations/6.0.6.Final/hibernate-commons-annotations-6.0.6.Final.jar:/Users/pierrebocquet/.m2/repository/io/smallrye/jandex/3.1.2/jandex-3.1.2.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/classmate/1.6.0/classmate-1.6.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy/1.14.13/byte-buddy-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar:/Users/pierrebocquet/.m2/repository/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-jpa/3.2.5/spring-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-commons/3.2.5/spring-data-commons-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-orm/6.1.6/spring-orm-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-tx/6.1.6/spring-tx-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aspects/6.1.6/spring-aspects-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-validation/3.2.5/spring-boot-starter-validation-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.20/tomcat-embed-el-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/validator/hibernate-validator/8.0.1.Final/hibernate-validator-8.0.1.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar:/Users/pierrebocquet/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar:/Users/pierrebocquet/.m2/repository/org/xerial/sqlite-jdbc/3.49.1.0/sqlite-jdbc-3.49.1.0.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-community-dialects/6.4.4.Final/hibernate-community-dialects-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/org/jboss/logging/jboss-logging/3.5.3.Final/jboss-logging-3.5.3.Final.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox/3.0.3/pdfbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox-io/3.0.3/pdfbox-io-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/fontbox/3.0.3/fontbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/commons-logging/commons-logging/1.3.3/commons-logging-1.3.3.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-test/3.2.5/spring-boot-starter-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test/3.2.5/spring-boot-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test-autoconfigure/3.2.5/spring-boot-test-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar:/Users/pierrebocquet/.m2/repository/net/minidev/json-smart/2.5.1/json-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/net/minidev/accessors-smart/2.5.1/accessors-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/org/ow2/asm/asm/9.6/asm-9.6.jar:/Users/pierrebocquet/.m2/repository/org/assertj/assertj-core/3.24.2/assertj-core-3.24.2.jar:/Users/pierrebocquet/.m2/repository/org/awaitility/awaitility/4.2.1/awaitility-4.2.1.jar:/Users/pierrebocquet/.m2/repository/org/hamcrest/hamcrest/2.2/hamcrest-2.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter/5.10.2/junit-jupiter-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-api/5.10.2/junit-jupiter-api-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-commons/1.10.2/junit-platform-commons-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-params/5.10.2/junit-jupiter-params-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-engine/5.10.2/junit-jupiter-engine-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-engine/1.10.2/junit-platform-engine-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-core/5.7.0/mockito-core-5.7.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.13/byte-buddy-agent-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/objenesis/objenesis/3.3/objenesis-3.3.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-junit-jupiter/5.7.0/mockito-junit-jupiter-5.7.0.jar:/Users/pierrebocquet/.m2/repository/org/skyscreamer/jsonassert/1.5.1/jsonassert-1.5.1.jar:/Users/pierrebocquet/.m2/repository/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-test/6.1.6/spring-test-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/xmlunit/xmlunit-core/2.9.1/xmlunit-core-2.9.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/client5/httpclient5/5.2.3/httpclient5-5.2.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5/5.2.4/httpcore5-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5-h2/5.2.4/httpcore5-h2-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar:"/>
     <property name="java.vm.vendor" value="Homebrew"/>
     <property name="sun.arch.data.model" value="64"/>
     <property name="net.bytebuddy.experimental" value="true"/>
@@ -16,10 +16,10 @@
     <property name="sun.java.launcher" value="SUN_STANDARD"/>
     <property name="user.country" value="FR"/>
     <property name="sun.boot.library.path" value="/opt/homebrew/Cellar/openjdk/26.0.1/libexec/openjdk.jdk/Contents/Home/lib"/>
-    <property name="sun.java.command" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/surefire/surefirebooter-20260712111320828_3.jar /Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/surefire 2026-07-12T11-13-20_799-jvmRun1 surefire-20260712111320828_1tmp surefire_0-20260712111320828_2tmp"/>
+    <property name="sun.java.command" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/surefire/surefirebooter-20260728125424722_3.jar /Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/surefire 2026-07-28T12-54-24_693-jvmRun1 surefire-20260728125424722_1tmp surefire_0-20260728125424722_2tmp"/>
     <property name="http.nonProxyHosts" value="local|*.local|169.254/16|*.169.254/16"/>
     <property name="jdk.debug" value="release"/>
-    <property name="surefire.test.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/test-classes:/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/classes:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter/3.2.5/spring-boot-starter-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot/3.2.5/spring-boot-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-context/6.1.6/spring-context-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-autoconfigure/3.2.5/spring-boot-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-logging/3.2.5/spring-boot-starter-logging-3.2.5.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-classic/1.4.14/logback-classic-1.4.14.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-core/1.4.14/logback-core-1.4.14.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-to-slf4j/2.21.1/log4j-to-slf4j-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-api/2.21.1/log4j-api-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/jul-to-slf4j/2.0.13/jul-to-slf4j-2.0.13.jar:/Users/pierrebocquet/.m2/repository/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-core/6.1.6/spring-core-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jcl/6.1.6/spring-jcl-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.2.5/spring-boot-starter-web-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-json/3.2.5/spring-boot-starter-json-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.15.4/jackson-databind-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.4/jackson-annotations-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.15.4/jackson-core-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.15.4/jackson-datatype-jdk8-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.15.4/jackson-datatype-jsr310-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/module/jackson-module-parameter-names/2.15.4/jackson-module-parameter-names-2.15.4.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-tomcat/3.2.5/spring-boot-starter-tomcat-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-core/10.1.20/tomcat-embed-core-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.20/tomcat-embed-websocket-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-web/6.1.6/spring-web-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-beans/6.1.6/spring-beans-6.1.6.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-observation/1.12.5/micrometer-observation-1.12.5.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-commons/1.12.5/micrometer-commons-1.12.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-webmvc/6.1.6/spring-webmvc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aop/6.1.6/spring-aop-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-expression/6.1.6/spring-expression-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-data-jpa/3.2.5/spring-boot-starter-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-aop/3.2.5/spring-boot-starter-aop-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/aspectj/aspectjweaver/1.9.22/aspectjweaver-1.9.22.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-jdbc/3.2.5/spring-boot-starter-jdbc-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/zaxxer/HikariCP/5.0.1/HikariCP-5.0.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jdbc/6.1.6/spring-jdbc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-core/6.4.4.Final/hibernate-core-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/jboss/logging/jboss-logging/3.5.3.Final/jboss-logging-3.5.3.Final.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/common/hibernate-commons-annotations/6.0.6.Final/hibernate-commons-annotations-6.0.6.Final.jar:/Users/pierrebocquet/.m2/repository/io/smallrye/jandex/3.1.2/jandex-3.1.2.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/classmate/1.6.0/classmate-1.6.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy/1.14.13/byte-buddy-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar:/Users/pierrebocquet/.m2/repository/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-jpa/3.2.5/spring-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-commons/3.2.5/spring-data-commons-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-orm/6.1.6/spring-orm-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-tx/6.1.6/spring-tx-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aspects/6.1.6/spring-aspects-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-validation/3.2.5/spring-boot-starter-validation-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.20/tomcat-embed-el-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/validator/hibernate-validator/8.0.1.Final/hibernate-validator-8.0.1.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar:/Users/pierrebocquet/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox/3.0.3/pdfbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox-io/3.0.3/pdfbox-io-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/fontbox/3.0.3/fontbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/commons-logging/commons-logging/1.3.3/commons-logging-1.3.3.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-test/3.2.5/spring-boot-starter-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test/3.2.5/spring-boot-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test-autoconfigure/3.2.5/spring-boot-test-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar:/Users/pierrebocquet/.m2/repository/net/minidev/json-smart/2.5.1/json-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/net/minidev/accessors-smart/2.5.1/accessors-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/org/ow2/asm/asm/9.6/asm-9.6.jar:/Users/pierrebocquet/.m2/repository/org/assertj/assertj-core/3.24.2/assertj-core-3.24.2.jar:/Users/pierrebocquet/.m2/repository/org/awaitility/awaitility/4.2.1/awaitility-4.2.1.jar:/Users/pierrebocquet/.m2/repository/org/hamcrest/hamcrest/2.2/hamcrest-2.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter/5.10.2/junit-jupiter-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-api/5.10.2/junit-jupiter-api-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-commons/1.10.2/junit-platform-commons-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-params/5.10.2/junit-jupiter-params-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-engine/5.10.2/junit-jupiter-engine-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-engine/1.10.2/junit-platform-engine-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-core/5.7.0/mockito-core-5.7.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.13/byte-buddy-agent-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/objenesis/objenesis/3.3/objenesis-3.3.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-junit-jupiter/5.7.0/mockito-junit-jupiter-5.7.0.jar:/Users/pierrebocquet/.m2/repository/org/skyscreamer/jsonassert/1.5.1/jsonassert-1.5.1.jar:/Users/pierrebocquet/.m2/repository/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-test/6.1.6/spring-test-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/xmlunit/xmlunit-core/2.9.1/xmlunit-core-2.9.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/client5/httpclient5/5.2.3/httpclient5-5.2.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5/5.2.4/httpcore5-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5-h2/5.2.4/httpcore5-h2-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar:"/>
+    <property name="surefire.test.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/test-classes:/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/classes:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter/3.2.5/spring-boot-starter-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot/3.2.5/spring-boot-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-context/6.1.6/spring-context-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-autoconfigure/3.2.5/spring-boot-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-logging/3.2.5/spring-boot-starter-logging-3.2.5.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-classic/1.4.14/logback-classic-1.4.14.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-core/1.4.14/logback-core-1.4.14.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-to-slf4j/2.21.1/log4j-to-slf4j-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-api/2.21.1/log4j-api-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/jul-to-slf4j/2.0.13/jul-to-slf4j-2.0.13.jar:/Users/pierrebocquet/.m2/repository/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-core/6.1.6/spring-core-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jcl/6.1.6/spring-jcl-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.2.5/spring-boot-starter-web-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-json/3.2.5/spring-boot-starter-json-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.15.4/jackson-databind-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.4/jackson-annotations-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.15.4/jackson-core-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.15.4/jackson-datatype-jdk8-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.15.4/jackson-datatype-jsr310-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/module/jackson-module-parameter-names/2.15.4/jackson-module-parameter-names-2.15.4.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-tomcat/3.2.5/spring-boot-starter-tomcat-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-core/10.1.20/tomcat-embed-core-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.20/tomcat-embed-websocket-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-web/6.1.6/spring-web-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-beans/6.1.6/spring-beans-6.1.6.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-observation/1.12.5/micrometer-observation-1.12.5.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-commons/1.12.5/micrometer-commons-1.12.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-webmvc/6.1.6/spring-webmvc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aop/6.1.6/spring-aop-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-expression/6.1.6/spring-expression-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-data-jpa/3.2.5/spring-boot-starter-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-aop/3.2.5/spring-boot-starter-aop-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/aspectj/aspectjweaver/1.9.22/aspectjweaver-1.9.22.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-jdbc/3.2.5/spring-boot-starter-jdbc-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/zaxxer/HikariCP/5.0.1/HikariCP-5.0.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jdbc/6.1.6/spring-jdbc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-core/6.4.4.Final/hibernate-core-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/common/hibernate-commons-annotations/6.0.6.Final/hibernate-commons-annotations-6.0.6.Final.jar:/Users/pierrebocquet/.m2/repository/io/smallrye/jandex/3.1.2/jandex-3.1.2.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/classmate/1.6.0/classmate-1.6.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy/1.14.13/byte-buddy-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar:/Users/pierrebocquet/.m2/repository/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-jpa/3.2.5/spring-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-commons/3.2.5/spring-data-commons-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-orm/6.1.6/spring-orm-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-tx/6.1.6/spring-tx-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aspects/6.1.6/spring-aspects-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-validation/3.2.5/spring-boot-starter-validation-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.20/tomcat-embed-el-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/validator/hibernate-validator/8.0.1.Final/hibernate-validator-8.0.1.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar:/Users/pierrebocquet/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar:/Users/pierrebocquet/.m2/repository/org/xerial/sqlite-jdbc/3.49.1.0/sqlite-jdbc-3.49.1.0.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-community-dialects/6.4.4.Final/hibernate-community-dialects-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/org/jboss/logging/jboss-logging/3.5.3.Final/jboss-logging-3.5.3.Final.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox/3.0.3/pdfbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox-io/3.0.3/pdfbox-io-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/fontbox/3.0.3/fontbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/commons-logging/commons-logging/1.3.3/commons-logging-1.3.3.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-test/3.2.5/spring-boot-starter-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test/3.2.5/spring-boot-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test-autoconfigure/3.2.5/spring-boot-test-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar:/Users/pierrebocquet/.m2/repository/net/minidev/json-smart/2.5.1/json-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/net/minidev/accessors-smart/2.5.1/accessors-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repository/org/ow2/asm/asm/9.6/asm-9.6.jar:/Users/pierrebocquet/.m2/repository/org/assertj/assertj-core/3.24.2/assertj-core-3.24.2.jar:/Users/pierrebocquet/.m2/repository/org/awaitility/awaitility/4.2.1/awaitility-4.2.1.jar:/Users/pierrebocquet/.m2/repository/org/hamcrest/hamcrest/2.2/hamcrest-2.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter/5.10.2/junit-jupiter-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-api/5.10.2/junit-jupiter-api-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/opentest4j/opentest4j/1.3.0/opentest4j-1.3.0.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-commons/1.10.2/junit-platform-commons-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/apiguardian/apiguardian-api/1.1.2/apiguardian-api-1.1.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-params/5.10.2/junit-jupiter-params-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/jupiter/junit-jupiter-engine/5.10.2/junit-jupiter-engine-5.10.2.jar:/Users/pierrebocquet/.m2/repository/org/junit/platform/junit-platform-engine/1.10.2/junit-platform-engine-1.10.2.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-core/5.7.0/mockito-core-5.7.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy-agent/1.14.13/byte-buddy-agent-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/objenesis/objenesis/3.3/objenesis-3.3.jar:/Users/pierrebocquet/.m2/repository/org/mockito/mockito-junit-jupiter/5.7.0/mockito-junit-jupiter-5.7.0.jar:/Users/pierrebocquet/.m2/repository/org/skyscreamer/jsonassert/1.5.1/jsonassert-1.5.1.jar:/Users/pierrebocquet/.m2/repository/com/vaadin/external/google/android-json/0.0.20131108.vaadin1/android-json-0.0.20131108.vaadin1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-test/6.1.6/spring-test-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/xmlunit/xmlunit-core/2.9.1/xmlunit-core-2.9.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/client5/httpclient5/5.2.3/httpclient5-5.2.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5/5.2.4/httpcore5-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/apache/httpcomponents/core5/httpcore5-h2/5.2.4/httpcore5-h2-5.2.4.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/slf4j-api/2.0.13/slf4j-api-2.0.13.jar:"/>
     <property name="sun.cpu.endian" value="little"/>
     <property name="user.home" value="/Users/pierrebocquet"/>
     <property name="user.language" value="fr"/>
@@ -27,7 +27,7 @@
     <property name="java.version.date" value="2026-04-21"/>
     <property name="java.home" value="/opt/homebrew/Cellar/openjdk/26.0.1/libexec/openjdk.jdk/Contents/Home"/>
     <property name="file.separator" value="/"/>
-    <property name="basedir" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend"/>
+    <property name="basedir" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend"/>
     <property name="java.vm.compressedOopsMode" value="Non-zero disjoint base"/>
     <property name="line.separator" value="&#10;"/>
     <property name="java.vm.specification.vendor" value="Oracle Corporation"/>
@@ -35,7 +35,7 @@
     <property name="FILE_LOG_CHARSET" value="UTF-8"/>
     <property name="java.awt.headless" value="true"/>
     <property name="apple.awt.application.name" value="ForkedBooter"/>
-    <property name="surefire.real.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/surefire/surefirebooter-20260712111320828_3.jar"/>
+    <property name="surefire.real.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend/target/surefire/surefirebooter-20260728125424722_3.jar"/>
     <property name="sun.management.compiler" value="HotSpot 64-Bit Tiered Compilers"/>
     <property name="ftp.nonProxyHosts" value="local|*.local|169.254/16|*.169.254/16"/>
     <property name="java.runtime.version" value="26.0.1"/>
@@ -50,15 +50,15 @@
     <property name="localRepository" value="/Users/pierrebocquet/.m2/repository"/>
     <property name="java.vendor.url.bug" value="https://github.com/Homebrew/homebrew-core/issues"/>
     <property name="java.io.tmpdir" value="/var/folders/0g/xf7sr5893d980r0nztgck6680000gn/T/"/>
-    <property name="catalina.home" value="/private/var/folders/0g/xf7sr5893d980r0nztgck6680000gn/T/tomcat.0.13734993551027570300"/>
+    <property name="catalina.home" value="/private/var/folders/0g/xf7sr5893d980r0nztgck6680000gn/T/tomcat.0.4353836576691429087"/>
     <property name="com.zaxxer.hikari.pool_number" value="1"/>
     <property name="java.version" value="26.0.1"/>
-    <property name="user.dir" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend"/>
+    <property name="user.dir" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T052/backend"/>
     <property name="os.arch" value="aarch64"/>
     <property name="java.vm.specification.name" value="Java Virtual Machine Specification"/>
-    <property name="PID" value="77839"/>
+    <property name="PID" value="88176"/>
     <property name="CONSOLE_LOG_CHARSET" value="UTF-8"/>
-    <property name="catalina.base" value="/private/var/folders/0g/xf7sr5893d980r0nztgck6680000gn/T/tomcat.0.13734993551027570300"/>
+    <property name="catalina.base" value="/private/var/folders/0g/xf7sr5893d980r0nztgck6680000gn/T/tomcat.0.4353836576691429087"/>
     <property name="native.encoding" value="UTF-8"/>
     <property name="java.library.path" value="/Users/pierrebocquet/Library/Java/Extensions:/Library/Java/Extensions:/Network/Library/Java/Extensions:/System/Library/Java/Extensions:/usr/lib/java:."/>
     <property name="java.vm.info" value="mixed mode, sharing"/>
@@ -73,10 +73,10 @@
   <testcase name="rejectsDisallowedFractionalValue" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.0"/>
   <testcase name="updatesToFull" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.0"/>
   <testcase name="updatesToHalf" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.0"/>
-  <testcase name="updatesToZero" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.001"/>
+  <testcase name="updatesToZero" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.0"/>
   <testcase name="workValueUnchangedOnRejection" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.0"/>
   <testcase name="rejectsNaN" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.0"/>
-  <testcase name="rejectsInfinity" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.0"/>
+  <testcase name="rejectsInfinity" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.001"/>
   <testcase name="rejectsNegativeValue" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.0"/>
   <testcase name="rejectsValueAboveOne" classname="com.timizer.backend.cra.CraDayEntryUpdateWorkValueTest" time="0.0"/>
 </testsuite>
\ No newline at end of file
diff --git a/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraTotalCalculationServiceTest.xml b/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraTotalCalculationServiceTest.xml
index 0f6aead9..6c9cfb4a 100644
--- a/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraTotalCalculationServiceTest.xml
+++ b/backend/target/surefire-reports/TEST-com.timizer.backend.cra.CraTotalCalculationServiceTest.xml
@@ -3,7 +3,7 @@
   <properties>
     <property name="java.specification.version" value="26"/>
     <property name="sun.jnu.encoding" value="UTF-8"/>
-    <property name="java.class.path" value="/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/test-classes:/Users/pierrebocquet/runtime/timizer-like/worktrees/T028/backend/target/classes:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter/3.2.5/spring-boot-starter-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot/3.2.5/spring-boot-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-context/6.1.6/spring-context-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-autoconfigure/3.2.5/spring-boot-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-logging/3.2.5/spring-boot-starter-logging-3.2.5.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-classic/1.4.14/logback-classic-1.4.14.jar:/Users/pierrebocquet/.m2/repository/ch/qos/logback/logback-core/1.4.14/logback-core-1.4.14.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-to-slf4j/2.21.1/log4j-to-slf4j-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/apache/logging/log4j/log4j-api/2.21.1/log4j-api-2.21.1.jar:/Users/pierrebocquet/.m2/repository/org/slf4j/jul-to-slf4j/2.0.13/jul-to-slf4j-2.0.13.jar:/Users/pierrebocquet/.m2/repository/jakarta/annotation/jakarta.annotation-api/2.1.1/jakarta.annotation-api-2.1.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-core/6.1.6/spring-core-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jcl/6.1.6/spring-jcl-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/yaml/snakeyaml/2.2/snakeyaml-2.2.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-web/3.2.5/spring-boot-starter-web-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-json/3.2.5/spring-boot-starter-json-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-databind/2.15.4/jackson-databind-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-annotations/2.15.4/jackson-annotations-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/core/jackson-core/2.15.4/jackson-core-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jdk8/2.15.4/jackson-datatype-jdk8-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/datatype/jackson-datatype-jsr310/2.15.4/jackson-datatype-jsr310-2.15.4.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/jackson/module/jackson-module-parameter-names/2.15.4/jackson-module-parameter-names-2.15.4.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-tomcat/3.2.5/spring-boot-starter-tomcat-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-core/10.1.20/tomcat-embed-core-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-websocket/10.1.20/tomcat-embed-websocket-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-web/6.1.6/spring-web-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-beans/6.1.6/spring-beans-6.1.6.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-observation/1.12.5/micrometer-observation-1.12.5.jar:/Users/pierrebocquet/.m2/repository/io/micrometer/micrometer-commons/1.12.5/micrometer-commons-1.12.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-webmvc/6.1.6/spring-webmvc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aop/6.1.6/spring-aop-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-expression/6.1.6/spring-expression-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-data-jpa/3.2.5/spring-boot-starter-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-aop/3.2.5/spring-boot-starter-aop-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/aspectj/aspectjweaver/1.9.22/aspectjweaver-1.9.22.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-jdbc/3.2.5/spring-boot-starter-jdbc-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/zaxxer/HikariCP/5.0.1/HikariCP-5.0.1.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-jdbc/6.1.6/spring-jdbc-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/orm/hibernate-core/6.4.4.Final/hibernate-core-6.4.4.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/persistence/jakarta.persistence-api/3.1.0/jakarta.persistence-api-3.1.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/transaction/jakarta.transaction-api/2.0.1/jakarta.transaction-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/jboss/logging/jboss-logging/3.5.3.Final/jboss-logging-3.5.3.Final.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/common/hibernate-commons-annotations/6.0.6.Final/hibernate-commons-annotations-6.0.6.Final.jar:/Users/pierrebocquet/.m2/repository/io/smallrye/jandex/3.1.2/jandex-3.1.2.jar:/Users/pierrebocquet/.m2/repository/com/fasterxml/classmate/1.6.0/classmate-1.6.0.jar:/Users/pierrebocquet/.m2/repository/net/bytebuddy/byte-buddy/1.14.13/byte-buddy-1.14.13.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-runtime/4.0.5/jaxb-runtime-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/jaxb-core/4.0.5/jaxb-core-4.0.5.jar:/Users/pierrebocquet/.m2/repository/org/eclipse/angus/angus-activation/2.0.2/angus-activation-2.0.2.jar:/Users/pierrebocquet/.m2/repository/org/glassfish/jaxb/txw2/4.0.5/txw2-4.0.5.jar:/Users/pierrebocquet/.m2/repository/com/sun/istack/istack-commons-runtime/4.1.2/istack-commons-runtime-4.1.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/inject/jakarta.inject-api/2.0.1/jakarta.inject-api-2.0.1.jar:/Users/pierrebocquet/.m2/repository/org/antlr/antlr4-runtime/4.13.0/antlr4-runtime-4.13.0.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-jpa/3.2.5/spring-data-jpa-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/data/spring-data-commons/3.2.5/spring-data-commons-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-orm/6.1.6/spring-orm-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-tx/6.1.6/spring-tx-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/spring-aspects/6.1.6/spring-aspects-6.1.6.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-validation/3.2.5/spring-boot-starter-validation-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/apache/tomcat/embed/tomcat-embed-el/10.1.20/tomcat-embed-el-10.1.20.jar:/Users/pierrebocquet/.m2/repository/org/hibernate/validator/hibernate-validator/8.0.1.Final/hibernate-validator-8.0.1.Final.jar:/Users/pierrebocquet/.m2/repository/jakarta/validation/jakarta.validation-api/3.0.2/jakarta.validation-api-3.0.2.jar:/Users/pierrebocquet/.m2/repository/com/h2database/h2/2.2.224/h2-2.2.224.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox/3.0.3/pdfbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/pdfbox-io/3.0.3/pdfbox-io-3.0.3.jar:/Users/pierrebocquet/.m2/repository/org/apache/pdfbox/fontbox/3.0.3/fontbox-3.0.3.jar:/Users/pierrebocquet/.m2/repository/commons-logging/commons-logging/1.3.3/commons-logging-1.3.3.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-starter-test/3.2.5/spring-boot-starter-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test/3.2.5/spring-boot-test-3.2.5.jar:/Users/pierrebocquet/.m2/repository/org/springframework/boot/spring-boot-test-autoconfigure/3.2.5/spring-boot-test-autoconfigure-3.2.5.jar:/Users/pierrebocquet/.m2/repository/com/jayway/jsonpath/json-path/2.9.0/json-path-2.9.0.jar:/Users/pierrebocquet/.m2/repository/jakarta/xml/bind/jakarta.xml.bind-api/4.0.2/jakarta.xml.bind-api-4.0.2.jar:/Users/pierrebocquet/.m2/repository/jakarta/activation/jakarta.activation-api/2.1.3/jakarta.activation-api-2.1.3.jar:/Users/pierrebocquet/.m2/repository/net/minidev/json-smart/2.5.1/json-smart-2.5.1.jar:/Users/pierrebocquet/.m2/repos

… truncated 1121425 chars from pr diff (conflict context size guard) …

```

---

## Ticket branch diff since merge-base (d5c50808)

(no source paths — only runtime/noise diffs against main)

---

## Latest main changes since 2026-07-28T10:55:38Z

```
d5c50808 T058 — Use a rectangular provider signature box in the CRA UI and PDF (#111)
ceaed17f T049 — Add editable provider profile settings (#109)
```

---

## Conflicted Files

### backend/src/test/java/com/timizer/backend/cra/api/CraControllerTest.java

```
package com.timizer.backend.cra.api;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.timizer.backend.cra.MonthlyCraCreationService;
import com.timizer.backend.cra.MonthlyCraCreationService.CraCreationResult;
import com.timizerlike.backend.cra.dto.CraDayEntryDto;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;

@WebMvcTest(CraController.class)
@Import(CraController.class)
class CraControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MonthlyCraCreationService creationService;

    @Test
    void returnsHttp201WhenCraIsCreated() throws Exception {
        CraDetailsDto dto = new CraDetailsDto(
                42L,
                3,
                2025,
                21.0,
                CraStatus.DRAFT,
                List.of(new CraDayEntryDto(1, 0.0, null), new CraDayEntryDto(2, 0.0, null)),
                null,
                null,
<<<<<<< HEAD
                "Alice",
                "Provider",
                "Provider Co.",
                "Bob",
                "Client",
                "Client Co.",
=======
                null,
                null,
                null,
                null,
>>>>>>> d86ff020 (chore(T052): pre-sync auto-commit)
                null,
                null
        );
        when(creationService.createForMonth(2025, 3)).thenReturn(new CraCreationResult(dto, true));

        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":2025,\"month\":3}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.month").value(3))
                .andExpect(jsonPath("$.year").value(2025))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.days.length()").value(2));
    }

    @Test
    void returnsHttp200WhenCraAlreadyExists() throws Exception {
        CraDetailsDto dto = new CraDetailsDto(
                7L,
                4,
                2025,
                20.0,
                CraStatus.DRAFT,
                List.of(),
                null,
                null,
<<<<<<< HEAD
                "Alice",
                "Provider",
                "Provider Co.",
                "Bob",
                "Client",
                "Client Co.",
=======
                null,
                null,
                null,
                null,
>>>>>>> d86ff020 (chore(T052): pre-sync auto-commit)
                null,
                null
        );
        when(creationService.createForMonth(2025, 4)).thenReturn(new CraCreationResult(dto, false));

        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":2025,\"month\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));
    }

    @Test
    void returnsHttp400WhenMonthIsOutOfRange() throws Exception {
        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":2025,\"month\":13}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsHttp400WhenYearIsOutOfRange() throws Exception {
        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":1999,\"month\":3}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsHttp400WhenFieldIsMissing() throws Exception {
        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":2025}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsHttp400WhenFieldIsNonNumeric() throws Exception {
        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":2025,\"month\":\"three\"}"))
                .andExpect(status().isBadRequest());
    }
}
```

### backend/src/test/java/com/timizerlike/backend/cra/web/CraValidationControllerTest.java

```
package com.timizerlike.backend.cra.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraValidatedException;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;
import com.timizerlike.cra.service.CraValidationService;

@WebMvcTest(CraValidationController.class)
@Import({CraValidationController.class, CraApiExceptionHandler.class})
class CraValidationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CraValidationService validationService;

    private static final CraDetailsDto VALIDATED_DTO = new CraDetailsDto(
            1L, 6, 2026, 20.0, CraStatus.VALIDATED,
            List.of(),
            LocalDate.of(2026, 6, 30),
            LocalDate.of(2026, 6, 30),
            null, null, null, null, null, null, null, null);

    @Test
    void returnsHttp200WithValidatedDtoOnSuccess() throws Exception {
        when(validationService.validate(eq(1L), any(LocalDate.class)))
                .thenReturn(VALIDATED_DTO);

        mockMvc.perform(post("/api/cras/1/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"providerSignatureDate\":\"2026-06-30\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("VALIDATED"))
                .andExpect(jsonPath("$.validationDate").value("2026-06-30"))
                .andExpect(jsonPath("$.providerSignatureDate").value("2026-06-30"));
    }

    @Test
    void returnsHttp404WhenCraNotFound() throws Exception {
        when(validationService.validate(any(), any()))
                .thenThrow(new CraNotFoundException(99L));

        mockMvc.perform(post("/api/cras/99/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"providerSignatureDate\":\"2026-06-30\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("cra_not_found"));
    }

    @Test
    void returnsHttp409WhenCraAlreadyValidated() throws Exception {
        when(validationService.validate(any(), any()))
                .thenThrow(new CraValidatedException(1L));

        mockMvc.perform(post("/api/cras/1/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"providerSignatureDate\":\"2026-06-30\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("cra_validated"));
    }

    @Test
    void returnsHttp400WhenProviderSignatureDateMissing() throws Exception {
        mockMvc.perform(post("/api/cras/1/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
```

### backend/src/test/java/com/timizerlike/cra/service/CraPdfDownloadServiceTest.java

```
package com.timizerlike.cra.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraNotValidatedException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.cra.pdf.CraPdfGenerator;
import com.timizerlike.cra.pdf.model.CraPdfDocument;

class CraPdfDownloadServiceTest {

    private static final Long CRA_ID = 1L;

    private MonthlyCraReportRepository craRepository;
    private CraPdfGenerator pdfGenerator;
    private CraPdfDownloadService service;

    @BeforeEach
    void setUp() {
        craRepository = mock(MonthlyCraReportRepository.class);
        pdfGenerator = mock(CraPdfGenerator.class);
        service = new CraPdfDownloadService(craRepository, pdfGenerator);
    }

    @Test
    void throwsCraNotFoundWhenCraAbsent() {
        when(craRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.download(99L))
                .isInstanceOf(CraNotFoundException.class);

        verify(pdfGenerator, never()).generate(any());
    }

    @Test
    void throwsCraNotValidatedWhenCraIsInDraftStatus() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.DRAFT);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.download(CRA_ID))
                .isInstanceOf(CraNotValidatedException.class);

        verify(pdfGenerator, never()).generate(any());
    }

    @Test
    void throwsCraNotValidatedWhenCraIsReadyForProviderSignature() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.download(CRA_ID))
                .isInstanceOf(CraNotValidatedException.class);

        verify(pdfGenerator, never()).generate(any());
    }

    @Test
    void returnsPdfBytesForSignedByProviderCra() {
        MonthlyCraReport cra = signedByProviderCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        byte[] pdfBytes = new byte[]{1, 2, 3};
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(pdfBytes);

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result.content()).isEqualTo(pdfBytes);
    }

    @Test
    void returnsPdfBytesForAwaitingClientSignatureCra() {
        MonthlyCraReport cra = signedByProviderCra();
        when(cra.getStatus()).thenReturn(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result).isNotNull();
    }

    @Test
    void returnsPdfBytesForFullySignedCra() {
        MonthlyCraReport cra = signedByProviderCra();
        when(cra.getStatus()).thenReturn(ValidationStatus.FULLY_SIGNED);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result).isNotNull();
    }

    @Test
    void returnsPdfBytesForValidatedCra() {
        MonthlyCraReport cra = validatedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        byte[] pdfBytes = new byte[]{1, 2, 3};
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(pdfBytes);

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result.content()).isEqualTo(pdfBytes);
    }

    @Test
    void filenameContainsPeriod() {
        MonthlyCraReport cra = validatedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result.filename()).contains("2026-06");
    }

    @Test
    void filenameContainsProviderAndClientCompany() {
        MonthlyCraReport cra = validatedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result.filename()).contains("Acme").contains("ClientCo");
    }

    @Test
    void filenameEndsWithPdfExtension() {
        MonthlyCraReport cra = validatedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result.filename()).endsWith(".pdf");
    }

    private MonthlyCraReport validatedCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getId()).thenReturn(CRA_ID);
        when(cra.getMonth()).thenReturn(6);
        when(cra.getYear()).thenReturn(2026);
        when(cra.getStatus()).thenReturn(ValidationStatus.VALIDATED);
        when(cra.getProviderFirstName()).thenReturn("John");
        when(cra.getProviderLastName()).thenReturn("Doe");
        when(cra.getProviderCompany()).thenReturn("Acme");
        when(cra.getClientFirstName()).thenReturn("Jane");
        when(cra.getClientLastName()).thenReturn("Smith");
        when(cra.getClientCompany()).thenReturn("ClientCo");
        when(cra.getClientContactEmail()).thenReturn("jane@clientco.com");
        when(cra.getProviderSignatureDate()).thenReturn(LocalDate.of(2026, 6, 30));
        when(cra.getProviderAddress()).thenReturn("1 rue Provider");
        when(cra.getProviderEmail()).thenReturn("john@example.com");
        when(cra.getDayEntries()).thenReturn(List.of());
        return cra;
    }

<<<<<<< HEAD
    @Test
    void snapshotAddressAndEmailPassedToPdfDocument() {
        MonthlyCraReport cra = validatedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});

        service.download(CRA_ID);

        ArgumentCaptor<CraPdfDocument> captor = ArgumentCaptor.forClass(CraPdfDocument.class);
        verify(pdfGenerator).generate(captor.capture());
        CraPdfDocument doc = captor.getValue();
        assertThat(doc.page1().provider().address()).isEqualTo("1 rue Provider");
        assertThat(doc.page1().provider().contact().email()).isEqualTo("john@example.com");
=======
    private MonthlyCraReport signedByProviderCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getId()).thenReturn(CRA_ID);
        when(cra.getMonth()).thenReturn(6);
        when(cra.getYear()).thenReturn(2026);
        when(cra.getStatus()).thenReturn(ValidationStatus.SIGNED_BY_PROVIDER);
        when(cra.getProviderFirstName()).thenReturn("John");
        when(cra.getProviderLastName()).thenReturn("Doe");
        when(cra.getProviderCompany()).thenReturn("Acme");
        when(cra.getClientFirstName()).thenReturn("Jane");
        when(cra.getClientLastName()).thenReturn("Smith");
        when(cra.getClientCompany()).thenReturn("ClientCo");
        when(cra.getClientContactEmail()).thenReturn("jane@clientco.com");
        when(cra.getProviderSignatureDate()).thenReturn(LocalDate.of(2026, 6, 30));
        when(cra.getDayEntries()).thenReturn(List.of());
        return cra;
>>>>>>> d86ff020 (chore(T052): pre-sync auto-commit)
    }
}
```

### frontend/src/App.tsx

```
import { useState, useEffect, useRef } from 'react';
import { CraMonthSelector } from './components/CraMonthSelector/CraMonthSelector';
import { CalendarGrid } from './components/CalendarGrid/CalendarGrid';
import { CraSummaryPanel } from './components/CraSummaryPanel/CraSummaryPanel';
import { CraHistory } from './components/CraHistory/CraHistory';
<<<<<<< HEAD
import { CraValidation } from './components/CraValidation/CraValidation';
import { ClientSettingsForm } from './components/ClientSettingsForm/ClientSettingsForm';
import { ProviderSettingsForm } from './components/ProviderSettingsForm/ProviderSettingsForm';
import { ProviderSignatureBox } from './components/ProviderSignatureBox/ProviderSignatureBox';
=======
>>>>>>> d86ff020 (chore(T052): pre-sync auto-commit)
import { AppShell } from './components/AppShell/AppShell';
import type { AppView } from './components/AppShell/AppShell';
import { getCra, updateDay } from './api/craClient';
import { getClientSettings } from './api/settingsClient';
import { getErrorMessage } from './api/errorMessages';
import type { CraSummaryDto, CraDetails } from './types/cra';
import type { CraDetailsDto } from './api/types';
import type { ClientSettingsDto } from './types/settings';

function dtoToDetails(dto: CraDetailsDto): CraDetails {
  return {
    id: dto.id,
    month: dto.month,
    year: dto.year,
    totalWorkedDays: dto.totalWorkedDays,
    status: dto.status,
    days: dto.days.map(d => ({ day: d.day, worked: d.worked, note: d.note ?? '' })),
    providerSignatureDate: dto.providerSignatureDate,
    providerFirstName: dto.providerFirstName ?? null,
    providerLastName: dto.providerLastName ?? null,
    providerCompany: dto.providerCompany ?? null,
    clientFirstName: dto.clientFirstName ?? null,
    clientLastName: dto.clientLastName ?? null,
    clientCompany: dto.clientCompany ?? null,
  };
}

export default function App() {
  const [view, setView] = useState<AppView>('selector');
  const [cra, setCra] = useState<CraDetails | null>(null);
  const [craLoading, setCraLoading] = useState(false);
  const [craError, setCraError] = useState<string | null>(null);
  const [lastCraId, setLastCraId] = useState<number | null>(null);
  const [updatingDay, setUpdatingDay] = useState<number | null>(null);
  const [dayUpdateError, setDayUpdateError] = useState<string | null>(null);
  const [clientSettings, setClientSettings] = useState<ClientSettingsDto | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);
  const craValidationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (view === 'settings' && clientSettings === null) {
      setSettingsError(null);
      getClientSettings()
        .then(setClientSettings)
        .catch(err => setSettingsError(getErrorMessage(err)));
    }
  }, [view, clientSettings]);

  const loadCra = (id: number) => {
    setCraLoading(true);
    setCraError(null);
    setCra(null);
    getCra(id)
      .then(dto => {
        setCra(dtoToDetails(dto));
        setCraLoading(false);
      })
      .catch(err => {
        setCraError(getErrorMessage(err));
        setCraLoading(false);
      });
  };

  const handleOpen = (summary: CraSummaryDto) => {
    setLastCraId(summary.id);
    loadCra(summary.id);
  };

  const handleSignatureSuccess = (updated: CraDetailsDto) => {
    setCra(dtoToDetails(updated));
  };

  const handleSignClick = () => {
    const btn = craValidationRef.current?.querySelector<HTMLButtonElement>('.cra-validation__button');
    btn?.click();
  };

  const handleDayClick = (day: number, newValue: 0 | 0.5 | 1) => {
    if (!cra) return;
    setUpdatingDay(day);
    setDayUpdateError(null);
    const isoDate = `${cra.year}-${String(cra.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    updateDay(cra.id, isoDate, { workValue: newValue })
      .then(dto => {
        setCra(dtoToDetails(dto));
        setUpdatingDay(null);
      })
      .catch(err => {
        setDayUpdateError(getErrorMessage(err));
        setUpdatingDay(null);
      });
  };

  return (
    <AppShell activeView={view} onNavigate={setView}>
      {view === 'settings' ? (
        <>
          <ProviderSettingsForm />
          {settingsError !== null ? (
            <p role="alert">{settingsError}</p>
          ) : clientSettings !== null ? (
            <ClientSettingsForm initialValues={clientSettings} />
          ) : null}
        </>
      ) : (
        <>
          {view === 'selector' ? (
            <CraMonthSelector onOpen={handleOpen} />
          ) : (
            <CraHistory onOpen={handleOpen} />
          )}
          <CraSummaryPanel cra={cra} loading={craLoading} error={craError} />
          <CalendarGrid
            cra={cra}
            loading={craLoading}
            error={craError}
            onRetry={lastCraId !== null ? () => loadCra(lastCraId) : undefined}
            onDayClick={cra?.status !== 'VALIDATED' ? handleDayClick : undefined}
            updatingDay={updatingDay}
            dayUpdateError={dayUpdateError}
          />
          {cra && (
            <ProviderSignatureBox cra={cra} onSignClick={handleSignClick} />
          )}
          <div ref={craValidationRef}>
            <CraValidation cra={cra} onValidated={handleCraValidated} />
          </div>
        </>
      )}
<<<<<<< HEAD
=======
      <CraSummaryPanel
        cra={cra}
        loading={craLoading}
        error={craError}
        onSuccess={handleSignatureSuccess}
      />
      <CalendarGrid
        cra={cra}
        loading={craLoading}
        error={craError}
        onRetry={lastCraId !== null ? () => loadCra(lastCraId) : undefined}
        onDayClick={cra?.status === 'DRAFT' ? handleDayClick : undefined}
        updatingDay={updatingDay}
        dayUpdateError={dayUpdateError}
      />
>>>>>>> d86ff020 (chore(T052): pre-sync auto-commit)
    </AppShell>
  );
}
```

### frontend/src/api/__tests__/craClient.test.ts

```
import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  createCra,
  getCra,
  updateDay,
<<<<<<< HEAD
  validateCra,
  listCras,
  downloadCraPdf,
  getProviderSettings,
  updateProviderSettings,
=======
  submitCra,
  signCraByProvider,
  sendCraToClient,
  listCras,
  downloadCraPdf,
>>>>>>> d86ff020 (chore(T052): pre-sync auto-commit)
} from '../craClient';
import { ApiError, isApiError } from '../apiError';
import type { CraDetailsDto, CraSummaryDto, ProviderSettingsDto } from '../types';

const mockCraDetails: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 20,
  status: 'DRAFT',
  days: [{ day: 1, worked: 1, note: null }],
  validationDate: null,
  providerSignatureDate: null,
};

const mockSummaries: CraSummaryDto[] = [
  { id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT', validationDate: null },
];

function mockFetchOk(body: unknown): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(body),
      blob: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
    }),
  );
}

function mockFetchError(status: number, errorCode: string): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status,
      json: () => Promise.resolve({ error: errorCode }),
    }),
  );
}

function mockFetchNetworkFailure(): void {
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
}

function mockFetchBlobOk(): void {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(['%PDF'], { type: 'application/pdf' })),
    }),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('createCra', () => {
  it('calls POST /api/cra and returns CraDetailsDto', async () => {
    mockFetchOk(mockCraDetails);
    const result = await createCra(2026, 7);
    expect(result).toEqual(mockCraDetails);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/cra',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('getCra', () => {
  it('calls GET /api/cras/:id and returns CraDetailsDto', async () => {
    mockFetchOk(mockCraDetails);
    const result = await getCra(1);
    expect(result).toEqual(mockCraDetails);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/cras/1', undefined);
  });
});

describe('updateDay', () => {
  it('calls PATCH /api/cras/:craId/days/:date and returns CraDetailsDto', async () => {
    mockFetchOk(mockCraDetails);
    const result = await updateDay(1, '2026-07-01', { workValue: 1 });
    expect(result).toEqual(mockCraDetails);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/cras/1/days/2026-07-01',
      expect.objectContaining({ method: 'PATCH' }),
    );
  });
});

describe('submitCra', () => {
  it('calls POST /api/cras/:craId/submit and returns CraDetailsDto', async () => {
    mockFetchOk({ ...mockCraDetails, status: 'READY_FOR_PROVIDER_SIGNATURE' });
    const result = await submitCra(1);
    expect(result.status).toBe('READY_FOR_PROVIDER_SIGNATURE');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/cras/1/submit',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('signCraByProvider', () => {
  it('calls POST /api/cras/:craId/sign-provider and returns CraDetailsDto', async () => {
    mockFetchOk({ ...mockCraDetails, status: 'SIGNED_BY_PROVIDER' });
    const result = await signCraByProvider(1, { providerSignatureDate: '2026-07-31' });
    expect(result.status).toBe('SIGNED_BY_PROVIDER');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/cras/1/sign-provider',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('sendCraToClient', () => {
  it('calls POST /api/cras/:craId/send-to-client and returns CraDetailsDto', async () => {
    mockFetchOk({ ...mockCraDetails, status: 'AWAITING_CLIENT_SIGNATURE' });
    const result = await sendCraToClient(1);
    expect(result.status).toBe('AWAITING_CLIENT_SIGNATURE');
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/cras/1/send-to-client',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});

describe('listCras', () => {
  it('calls GET /api/cras and returns CraSummaryDto[]', async () => {
    mockFetchOk(mockSummaries);
    const result = await listCras();
    expect(result).toEqual(mockSummaries);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/cras', undefined);
  });
});

describe('downloadCraPdf', () => {
  it('calls GET /api/cras/:id/pdf and returns a Blob', async () => {
    mockFetchBlobOk();
    const result = await downloadCraPdf(1);
    expect(result).toBeInstanceOf(Blob);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/cras/1/pdf', undefined);
  });
});

const mockProviderSettings: ProviderSettingsDto = {
  firstName: 'Jean',
  lastName: 'Dupont',
  company: 'Acme',
  address: '1 rue Paix',
  email: 'jean@acme.com',
  phone: '0600000000',
};

describe('getProviderSettings', () => {
  it('calls GET /api/provider-settings and returns ProviderSettingsDto', async () => {
    mockFetchOk(mockProviderSettings);
    const result = await getProviderSettings();
    expect(result).toEqual(mockProviderSettings);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith('/api/provider-settings', undefined);
  });

  it('maps network failure to ApiError', async () => {
    mockFetchNetworkFailure();
    await expect(getProviderSettings()).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'network_error',
    );
  });
});

describe('updateProviderSettings', () => {
  it('calls PUT /api/provider-settings and returns ProviderSettingsDto', async () => {
    mockFetchOk(mockProviderSettings);
    const result = await updateProviderSettings(mockProviderSettings);
    expect(result).toEqual(mockProviderSettings);
    expect(vi.mocked(fetch)).toHaveBeenCalledWith(
      '/api/provider-settings',
      expect.objectContaining({ method: 'PUT' }),
    );
  });

  it('maps network failure to ApiError', async () => {
    mockFetchNetworkFailure();
    await expect(updateProviderSettings(mockProviderSettings)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'network_error',
    );
  });
});

describe('error mapping', () => {
  it('maps 400 invalid_work_value to ApiError with correct code', async () => {
    mockFetchError(400, 'invalid_work_value');
    await expect(updateDay(1, '2026-07-01', { workValue: 0.5 })).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'invalid_work_value' && e.httpStatus === 400,
    );
  });

  it('maps 409 cra_validated to ApiError with correct code', async () => {
    mockFetchError(409, 'cra_validated');
    await expect(updateDay(1, '2026-07-01', { workValue: 1 })).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'cra_validated' && e.httpStatus === 409,
    );
  });

  it('maps 409 invalid_cra_transition to ApiError with correct code', async () => {
    mockFetchError(409, 'invalid_cra_transition');
    await expect(submitCra(1)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'invalid_cra_transition' && e.httpStatus === 409,
    );
  });

  it('maps 409 duplicate_cra_transition to ApiError with correct code', async () => {
    mockFetchError(409, 'duplicate_cra_transition');
    await expect(submitCra(1)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'duplicate_cra_transition' && e.httpStatus === 409,
    );
  });

  it('maps 404 cra_not_found to ApiError with correct code', async () => {
    mockFetchError(404, 'cra_not_found');
    await expect(getCra(99)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'cra_not_found' && e.httpStatus === 404,
    );
  });

  it('maps 404 cra_day_not_found to ApiError with correct code', async () => {
    mockFetchError(404, 'cra_day_not_found');
    await expect(updateDay(1, '2026-07-31', {})).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'cra_day_not_found' && e.httpStatus === 404,
    );
  });

  it('maps unknown error code to unknown_error', async () => {
    mockFetchError(500, 'something_unexpected');
    await expect(createCra(2026, 7)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'unknown_error' && e.httpStatus === 500,
    );
  });

  it('maps network failure to ApiError with code network_error', async () => {
    mockFetchNetworkFailure();
    await expect(createCra(2026, 7)).rejects.toSatisfy(
      (e: unknown) => isApiError(e) && e.code === 'network_error' && e.httpStatus === null,
    );
  });
});
```

### frontend/src/api/craClient.ts

```
import { apiGet, apiGetBlob, apiPatch, apiPost, apiPut } from './httpClient';
import type {
  CraDetailsDto,
  CraDayUpdateRequest,
  CraSummaryDto,
<<<<<<< HEAD
  ProviderSettingsDto,
  ValidateCraRequest,
=======
  SignProviderRequest,
>>>>>>> d86ff020 (chore(T052): pre-sync auto-commit)
} from './types';

export function createCra(year: number, month: number): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>('/api/cra', { year, month });
}

export function getCra(id: number): Promise<CraDetailsDto> {
  return apiGet<CraDetailsDto>(`/api/cras/${id}`);
}

export function updateDay(
  craId: number,
  date: string,
  body: CraDayUpdateRequest,
): Promise<CraDetailsDto> {
  return apiPatch<CraDetailsDto>(`/api/cras/${craId}/days/${date}`, body);
}

export function submitCra(craId: number): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>(`/api/cras/${craId}/submit`, null);
}

export function signCraByProvider(craId: number, body: SignProviderRequest): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>(`/api/cras/${craId}/sign-provider`, body);
}

export function sendCraToClient(craId: number): Promise<CraDetailsDto> {
  return apiPost<CraDetailsDto>(`/api/cras/${craId}/send-to-client`, null);
}

export function listCras(options?: { signal?: AbortSignal }): Promise<CraSummaryDto[]> {
  return apiGet<CraSummaryDto[]>('/api/cras', options);
}

export function downloadCraPdf(craId: number, options?: { signal?: AbortSignal }): Promise<Blob> {
  return apiGetBlob(`/api/cras/${craId}/pdf`, options);
}

export function getProviderSettings(): Promise<ProviderSettingsDto> {
  return apiGet<ProviderSettingsDto>('/api/provider-settings');
}

export function updateProviderSettings(data: ProviderSettingsDto): Promise<ProviderSettingsDto> {
  return apiPut<ProviderSettingsDto>('/api/provider-settings', data);
}
```

### frontend/src/components/CraHistory/CraHistory.css

```
.cra-history {
  margin-top: var(--space-4);
}

.cra-history__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

/* Card */
.cra-history__card {
  background: var(--color-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-4);
  flex-wrap: wrap;
}

.cra-history__card-period {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  flex: 1 1 120px;
}

.cra-history__card-meta {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-4);
  flex: 2 1 240px;
  flex-wrap: wrap;
}

.cra-history__card-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: var(--space-2);
  flex: 0 0 auto;
}

/* Status badge */
.cra-history__badge {
  display: inline-block;
  padding: var(--space-1) 0.625rem;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.cra-history__badge--draft {
  background-color: #f3f4f6;
  color: #6b7280;
}

<<<<<<< HEAD
.cra-history__badge--validated {
  background-color: var(--color-success-bg);
  color: var(--color-success-text);
=======
.cra-history__badge--ready-for-provider {
  background-color: #dbeafe;
  color: #1e40af;
}

.cra-history__badge--signed-by-provider {
  background-color: #fef3c7;
  color: #92400e;
}

.cra-history__badge--awaiting-client {
  background-color: #fef9c3;
  color: #854d0e;
}

.cra-history__badge--signed {
  background-color: #d1fae5;
  color: #065f46;
>>>>>>> d86ff020 (chore(T052): pre-sync auto-commit)
}

/* Meta labels and values */
.cra-history__days,
.cra-history__validation {
  font-size: var(--font-size-sm);
  color: var(--color-neutral-700);
  white-space: nowrap;
}

.cra-history__label {
  color: var(--color-text-subtle);
}

/* Buttons */
.cra-history__btn {
  min-height: 44px;
  padding: var(--space-2) var(--space-4);
  border: var(--border-width) solid var(--color-neutral-300);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  color: var(--color-neutral-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  white-space: nowrap;
}

.cra-history__btn:hover:not(:disabled) {
  background: var(--color-bg);
}

.cra-history__btn:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}

.cra-history__btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cra-history__btn--download {
  background: var(--color-primary);
  color: var(--color-white);
  border-color: var(--color-primary);
}

.cra-history__btn--download:hover:not(:disabled) {
  background: var(--color-primary-hover);
}

/* Error banner */
.cra-history__error {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding: var(--space-3) var(--space-4);
  border-radius: var(--radius-lg);
  background: var(--color-error-light);
  color: var(--color-error);
  font-weight: var(--font-weight-medium);
  margin-bottom: var(--space-4);
  max-width: 100%;
}

.cra-history__error--inline {
  margin-bottom: var(--space-3);
}

.cra-history__error-icon {
  font-size: 1.1em;
  flex-shrink: 0;
}

/* Empty state */
.cra-history__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: var(--space-12) var(--space-4);
  text-align: center;
  color: var(--color-text-muted);
}

.cra-history__empty-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-3);
  opacity: 0.5;
}

.cra-history__empty p {
  margin: var(--space-1) 0;
}

.cra-history__empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-subtle);
}

/* Loading skeleton */
.cra-history__card--skeleton {
  pointer-events: none;
}

.cra-history__skeleton-block {
  border-radius: var(--radius-md);
  background: linear-gradient(90deg, var(--color-neutral-200) 25%, var(--color-bg) 50%, var(--color-neutral-200) 75%);
  background-size: 200% 100%;
  animation: shimmer 1.4s infinite;
}

.cra-history__skeleton-block--period {
  height: var(--font-size-lg);
  width: 120px;
  flex: 1 1 120px;
}

.cra-history__skeleton-block--badge {
  height: var(--font-size-lg);
  width: 72px;
  border-radius: var(--radius-full);
}

.cra-history__skeleton-block--days {
  height: var(--font-size-lg);
  width: 80px;
}

.cra-history__skeleton-block--actions {
  height: 44px;
  width: 100px;
  flex: 0 0 auto;
  border-radius: var(--radius-lg);
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* Mobile responsive */
@media (max-width: 640px) {
  .cra-history__card {
    flex-direction: column;
    align-items: flex-start;
  }

  .cra-history__card-meta {
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .cra-history__card-actions {
    width: 100%;
  }

  .cra-history__btn {
    flex: 1;
    text-align: center;
  }
}
```

### frontend/src/components/CraSummaryPanel/CraSummaryPanel.tsx

```
import './CraSummaryPanel.css';
import { CraSignatureStatus } from '../CraSignatureStatus/CraSignatureStatus';
import { CraSignatureActions } from '../CraSignatureActions/CraSignatureActions';
import type { CraDetails } from '../../types/cra';
<<<<<<< HEAD
import { SectionHeading } from '../SectionHeading/SectionHeading';
=======
import type { CraDetailsDto } from '../../api/types';
>>>>>>> d86ff020 (chore(T052): pre-sync auto-commit)

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

interface Props {
  cra: CraDetails | null;
  loading: boolean;
  error: string | null;
  onSuccess?: (updated: CraDetailsDto) => void;
}

export function CraSummaryPanel({ cra, loading, error, onSuccess }: Props) {
  if (loading) {
    return (
      <div className="cra-summary-panel__loading" data-testid="summary-loading">
        Loading summary...
      </div>
    );
  }
  if (error) {
    return (
      <div className="cra-summary-panel__error" data-testid="summary-error" role="alert">
        Error: {error}
      </div>
    );
  }
  if (!cra) return null;

  const period = `${MONTH_NAMES[cra.month - 1]} ${cra.year}`;
  const providerName = [cra.providerFirstName, cra.providerLastName].filter(Boolean).join(' ') || '—';
  const clientName = [cra.clientFirstName, cra.clientLastName].filter(Boolean).join(' ') || '—';

  return (
    <section className="cra-summary-panel" aria-label="CRA Summary">
      <header className="cra-summary-panel__header">
        <SectionHeading title="Compte Rendu d'Activité" />
        <p className="cra-summary-panel__period" data-testid="summary-period">{period}</p>
      </header>
      <div className="cra-summary-panel__hero">
        <strong data-testid="summary-total" className="cra-summary-panel__hero-value">
          {cra.totalWorkedDays}
        </strong>
        <span className="cra-summary-panel__hero-label">Total worked days</span>
      </div>
      <div className="cra-summary-panel__status-row">
        <CraSignatureStatus status={cra.status} data-testid="summary-status" />
      </div>
      <dl className="cra-summary-panel__meta">
        <div className="cra-summary-panel__meta-item">
          <dt>Provider</dt>
          <dd data-testid="summary-provider">{providerName}</dd>
        </div>
        <div className="cra-summary-panel__meta-item">
          <dt>Provider company</dt>
          <dd data-testid="summary-provider-company">{cra.providerCompany ?? '—'}</dd>
        </div>
        <div className="cra-summary-panel__meta-item">
          <dt>Client</dt>
          <dd data-testid="summary-client">{clientName}</dd>
        </div>
      </dl>
      {onSuccess && (
        <CraSignatureActions cra={cra} onSuccess={onSuccess} />
      )}
    </section>
  );
}
```

### frontend/src/components/CraValidation/CraValidation.axe.test.tsx

```
import { render, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { axe } from 'jest-axe';
import { CraValidation } from './CraValidation';
import type { CraDetails } from '../../types/cra';

vi.mock('../../api/craClient', () => ({
  validateCra: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const DRAFT_CRA: CraDetails = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status: 'DRAFT',
  days: [],
  providerSignatureDate: null,
};

describe('CraValidation accessibility', () => {
  it('has no axe violations in idle state', async () => {
    const { container } = render(
      <CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no axe violations in confirming state (dialog open)', async () => {
    const { container, getByRole } = render(
      <CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />,
    );
    fireEvent.click(getByRole('button', { name: /valider le cra/i }));
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### frontend/src/components/CraValidation/CraValidation.css

```
.cra-validation {
  padding: var(--space-4);
}

.cra-validation__dialog {
  max-width: min(90vw, 480px);
  box-sizing: border-box;
}

.cra-validation__button {
  display: block;
  width: 100%;
  min-height: 44px;
  padding: var(--space-2) var(--space-4);
  background-color: var(--color-primary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
}

.cra-validation__button:hover {
  background-color: var(--color-primary-hover);
}

.cra-validation-dialog {
  max-width: 480px;
  width: 100%;
  border: none;
  border-radius: var(--radius-lg);
  padding: var(--space-6);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
}

.cra-validation-dialog::backdrop {
  background-color: rgba(0, 0, 0, 0.4);
}

.cra-validation__warning {
  color: var(--color-warning-text);
  background-color: var(--color-warning-light);
  border: var(--border-width) solid var(--color-warning-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  margin: 0 0 var(--space-4);
  font-size: var(--font-size-base);
}

.cra-validation__actions {
  display: flex;
  gap: var(--space-2);
  justify-content: flex-end;
}

.cra-validation__confirm {
  min-height: 44px;
  padding: var(--space-2) var(--space-5);
  background-color: var(--color-destructive);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
}

.cra-validation__confirm:hover:not(:disabled) {
  background-color: var(--color-destructive-hover);
}

.cra-validation__confirm:disabled,
.cra-validation__cancel:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cra-validation__cancel {
  min-height: 44px;
  padding: var(--space-2) var(--space-5);
  background-color: var(--color-secondary);
  color: var(--color-white);
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: var(--font-size-base);
}

.cra-validation__cancel:hover:not(:disabled) {
  background-color: var(--color-secondary-hover);
}

.cra-validation__error {
  color: var(--color-error);
  background-color: var(--color-error-light);
  border: var(--border-width) solid var(--color-error-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  margin: 0 0 var(--space-4);
  font-size: var(--font-size-sm);
}

@media (max-width: 480px) {
  .cra-validation-dialog {
    max-width: 95vw;
    padding: var(--space-4);
  }

  .cra-validation__actions {
    flex-direction: column-reverse;
  }

  .cra-validation__confirm,
  .cra-validation__cancel {
    width: 100%;
  }
}

.cra-validation__success {
  color: var(--color-success-text);
  background-color: var(--color-success-bg);
  border: var(--border-width) solid var(--color-success-border);
  border-radius: var(--radius-md);
  padding: var(--space-2) var(--space-3);
  font-size: var(--font-size-sm);
}
```

### frontend/src/components/CraValidation/CraValidation.test.tsx

```
import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CraValidation } from './CraValidation';
import { validateCra } from '../../api/craClient';
import type { CraDetails } from '../../types/cra';
import type { CraDetailsDto } from '../../api/types';

vi.mock('../../api/craClient', () => ({
  validateCra: vi.fn(),
}));

const mockValidateCra = vi.mocked(validateCra);

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.useRealTimers();
});

const DRAFT_CRA: CraDetails = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status: 'DRAFT',
  days: [],
  providerSignatureDate: null,
};

const VALIDATED_CRA: CraDetails = { ...DRAFT_CRA, status: 'VALIDATED' };

const VALIDATED_DTO: CraDetailsDto = {
  id: 1,
  month: 7,
  year: 2026,
  totalWorkedDays: 10,
  status: 'VALIDATED',
  days: [],
  validationDate: '2026-07-20',
  providerSignatureDate: '2026-07-20',
};

describe('CraValidation', () => {
  it('renders validate button for DRAFT CRA', () => {
    render(<CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />);
    expect(screen.getByRole('button', { name: /valider le cra/i })).toBeInTheDocument();
  });

  it('renders nothing for VALIDATED CRA', () => {
    const { container } = render(<CraValidation cra={VALIDATED_CRA} onValidated={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders nothing when cra is null', () => {
    const { container } = render(<CraValidation cra={null} onValidated={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('clicking validate button shows confirmation UI', () => {
    render(<CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/verrouille le cra/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /annuler/i })).toBeInTheDocument();
  });

  it('clicking annuler hides confirmation and does not call validateCra', () => {
    render(<CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    fireEvent.click(screen.getByRole('button', { name: /annuler/i }));
    expect(screen.getByRole('button', { name: /valider le cra/i })).toBeInTheDocument();
    expect(mockValidateCra).not.toHaveBeenCalled();
  });

  it('shows success message then calls onValidated after delay', async () => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
    mockValidateCra.mockResolvedValueOnce(VALIDATED_DTO);
    const onValidated = vi.fn();
    render(<CraValidation cra={DRAFT_CRA} onValidated={onValidated} />);
    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await act(async () => {}); // flush validateCra promise → success state
    expect(screen.getByText('CRA validé avec succès.')).toBeInTheDocument();
    expect(onValidated).not.toHaveBeenCalled();
    act(() => { vi.advanceTimersByTime(2000); });
    expect(onValidated).toHaveBeenCalledWith(VALIDATED_DTO);
    expect(mockValidateCra).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ providerSignatureDate: expect.any(String) }),
    );
  });

  it('disables confirmer and annuler while request is in-flight', async () => {
    let resolve!: (v: CraDetailsDto) => void;
    mockValidateCra.mockReturnValueOnce(new Promise(r => { resolve = r; }));
    render(<CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /validation/i })).toBeDisabled(),
    );
    expect(screen.getByRole('button', { name: /annuler/i })).toBeDisabled();
    resolve(VALIDATED_DTO);
  });

  it('displays error inside dialog and re-enables action buttons on API error', async () => {
    mockValidateCra.mockRejectedValueOnce(new Error('Server error'));
    render(<CraValidation cra={DRAFT_CRA} onValidated={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /valider le cra/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirmer/i }));
    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /confirmer/i })).not.toBeDisabled();
    expect(screen.getByRole('button', { name: /annuler/i })).not.toBeDisabled();
  });
});
```