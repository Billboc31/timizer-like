# T078 — Test Report

**Date:** 2026-08-05
**Branch:** ticket/T078-replace-provider-profile-fields-and-include-them-i
**Tester:** Claude (automated)

---

## Commands executed

```bash
# Backend tests
cd backend && mvn test

# Frontend unit tests
cd frontend && npm test -- --run

# TypeScript type check
cd frontend && npx tsc --noEmit
```

---

## Results by acceptance criterion

### ✅ AC1 — Provider can edit and persist raison sociale, SIRET, address, postal code, city, country from Settings

All 6 fields implemented end-to-end:
- Backend: `ProviderSettings` entity + `ProviderSettingsDto` with validation (`@NotBlank` on raisonSociale, `@Pattern(regexp="^\d{14}$")` on siret)
- API: GET/PUT `/api/provider-settings`
- Frontend: `ProviderSettingsForm.tsx` with all 6 inputs and client-side validation
- `ProviderSettingsControllerTest` (3 tests) — all pass

### ✅ AC2 — Saved values restored after page refresh and application restart

`ProviderSettingsService.getSettings()` returns stored row or seeds defaults. Frontend form populates from API on mount.
`ProviderSettingsServiceTest` (3 tests) — all pass.

### ✅ AC3 — Generated CRA PDFs contain saved provider legal information

- `CraPdfDownloadService` extracts all 6 fields from snapshot and formats address via `formatProviderAddress()`
- `CraPdfGenerator.drawPartyBlock()` renders name, SIRET, and address
- `MonthlyCraReport` stores all 6 provider columns at CRA creation time
- `CraPdfGeneratorTest` (27 tests) and `CraPdfDownloadServiceTest` (12 tests) — all pass

### ✅ AC4 — Obsolete provider fields removed from Settings UI and PDF

Old fields (firstName, lastName, company, address, email, phone) absent from entity, DTO, API, and frontend form.
No references found in production code paths.

### ✅ AC5 — Existing data migration handled safely

Hibernate `ddl-auto: update` manages schema evolution automatically. Acceptable for this SQLite-based stack.

### ✅ AC6 — PDF remains readable when values are long or partially missing

`formatProviderAddress()` skips null fields. `drawPartyBlock()` wraps long text. Backend PDF layout tests pass.

---

## Test run summary

| Suite | Result | Tests |
|---|---|---|
| Backend (mvn test) | ✅ BUILD SUCCESS | 116 pass, 0 fail |
| Frontend (vitest) | ✅ PASS | 285 pass, 0 fail |
| Frontend (tsc --noEmit) | ❌ FAIL | 21 errors |

---

## Issues found

### 🔴 BLOCKING — Wrong property name in production component

**File:** `frontend/src/components/ProviderSignatureBox/ProviderSignatureBox.tsx:41`

```tsx
// ERROR: property does not exist
{cra.providerSignatureImageUrl && (
  <img src={cra.providerSignatureImageUrl} ... />
)}
```

The `CraDetails` type has `providerSignatureImage`, not `providerSignatureImageUrl`. The provider signature image will never render — the condition is always falsy. TypeScript:
```
TS2551: Property 'providerSignatureImageUrl' does not exist on type 'CraDetails'. Did you mean 'providerSignatureImage'?
```

### 🔴 BLOCKING — Broken interface extension in types/cra.ts

**File:** `frontend/src/types/cra.ts:34`

```ts
export type { CraSummaryDto } from '../api/types';   // re-exports but does NOT import into scope
// ...
export interface CraDetailsDto extends CraSummaryDto { // ERROR: CraSummaryDto not in scope
```

`CraSummaryDto` is re-exported but not imported into this file's local scope. `CraDetailsDto` is structurally broken. TypeScript:
```
TS2304: Cannot find name 'CraSummaryDto'.
```
Fix: add `import type { CraSummaryDto } from '../api/types';` alongside the export.

### 🟡 NON-BLOCKING — Stale mock in craClient.test.ts

**File:** `frontend/src/api/__tests__/craClient.test.ts:138-145`

`mockProviderSettings` still uses old fields (`firstName`, `lastName`, `company`, `address`, `email`, `phone`) instead of new ones. TypeScript:
```
TS2353: Object literal may only specify known properties, and 'firstName' does not exist in type 'ProviderSettingsDto'.
```
Test passes at runtime (vitest skips tsc), but the mock is a type lie.

### 🟡 NON-BLOCKING — errorMessages.ts incomplete Record

**File:** `frontend/src/api/errorMessages.ts:4`

`ERROR_MESSAGES` is typed as `Record<ApiErrorCode, string>` but is missing `cra_wrong_status` and `token_not_found`. TypeScript:
```
TS2739: missing properties from type 'Record<ApiErrorCode, string>': cra_wrong_status, token_not_found
```

### 🟡 NON-BLOCKING — Test fixtures missing new required DTO fields

Multiple test files create `CraDetailsDto` / `CraSummaryDto` objects without the required `clientSignatureDate` and `clientRepresentativeName` fields added by this ticket:
- `src/App.test.tsx:24,52`
- `src/api/__tests__/craClient.test.ts:15`
- `src/components/CalendarGrid/CalendarGrid.test.tsx:29`
- `src/components/CraHistory/CraHistory.axe.test.tsx:15,24`
- `src/components/CraMonthSelector/CraMonthSelector.test.tsx:15,24`
- `src/components/CraMonthSelector/CraMonthSelector.tsx:55` (production)
- `src/components/CraValidation/CraValidation.test.tsx:27,43`
- `src/components/CraValidation/CraValidation.axe.test.tsx:23`

### 🟡 NON-BLOCKING — Null guard missing in CalendarGrid.tsx

**File:** `frontend/src/components/CalendarGrid/CalendarGrid.tsx:96`

`cra` accessed without null guard where TypeScript considers it possibly null:
```
TS18047: 'cra' is possibly 'null'.
```

---

## Verdict

**REFUSED — implementation incomplete.**

All 6 acceptance criteria are functionally addressed and backend + vitest tests pass. However, two blocking TypeScript errors exist in production frontend code introduced by this ticket:

1. `ProviderSignatureBox.tsx` references non-existent `providerSignatureImageUrl` (should be `providerSignatureImage`) — the provider signature image never displays after signing.
2. `types/cra.ts` defines `CraDetailsDto extends CraSummaryDto` where `CraSummaryDto` is out of scope — the type is structurally invalid.

These two issues must be corrected. The non-blocking issues (stale test mocks, incomplete error messages map, missing fixture fields, CalendarGrid null guard) should also be fixed to restore a clean `tsc --noEmit`.

---

# GLOBAL CONTEXT

# Global Context — Timizer Like

## Project

- project_id: timizer-like
- repo: git@github.com:Billboc31/timizer-like.git

## AI Dev Factory

This project uses AI Dev Factory for AI-assisted development.

Agent context folders:
- `ai/` — roles and skills
- `docs/` — project documentation
- `prompts/` — ticket-specific and generic prompts
- `runs/` — per-ticket runtime artifacts
- `tickets/` — ticket definitions

---

# ROLE

# Role — Tester

## Mission

Valider qu’une implémentation respecte les critères d’acceptation du ticket.

## Tu dois

- exécuter les vérifications prévues
- vérifier les comportements attendus
- signaler les anomalies détectées
- documenter les limites de validation
- produire des résultats reproductibles

## Tu ne dois pas

- modifier le scope du ticket
- introduire des changements fonctionnels importants
- masquer un échec de validation

## Sortie attendue

- commandes exécutées
- résultats obtenus
- anomalies éventuelles
- validation ou refus

## Règles

- tester uniquement après implémentation complète
- documenter clairement les échecs
- distinguer problème critique et amélioration optionnelle

---

# SKILL: workflow-discipline

# Skill — Workflow Discipline

## Objectif

Faire respecter le lifecycle officiel des tickets et PR IA.

## Règles

- respecter l’ordre des étapes du workflow
- ne pas bypass les reviews obligatoires
- maintenir les statuts cohérents
- conserver les artefacts versionnés
- séparer plan, implémentation et mémoire

## Refuser si

- une review obligatoire est sautée
- la mémoire est mise à jour avant validation implémentation
- le workflow officiel est contourné

---

# SKILL: testing

# Skill — Testing

## Objectif

Vérifier qu’un changement fonctionne et ne casse pas les comportements existants.

## Règles

- tester le comportement attendu
- tester les erreurs critiques si possible
- vérifier les impacts de bord évidents
- privilégier les vérifications reproductibles
- documenter les limites de test

## Refuser si

- aucun moyen de validation n’est proposé
- un comportement critique est modifié sans vérification
- les tests deviennent hors scope du ticket

---

# SKILL: debugging

# Skill — Debugging

## Objectif

Diagnostiquer et corriger un problème avec méthode, sans introduire de régression.

## Règles

- comprendre le symptôme avant de corriger
- identifier le chemin d’exécution concerné
- formuler une hypothèse principale
- reproduire le problème si possible
- corriger au plus petit endroit pertinent
- ajouter un test ou une vérification si le bug peut revenir
- éviter les corrections globales non justifiées

## Refuser si

- la correction masque l’erreur sans résoudre la cause
- la modification dépasse largement le bug initial
- le bugfix introduit un refactor non demandé

---

# TASK

# Generic Tester Task

Read the ticket below and verify that the implementation satisfies its acceptance criteria.

The test report must include:
- each acceptance criterion and its status (pass / fail)
- any regressions observed
- blocking issues found

The ticket follows.


# T078 — Replace provider profile fields and include them in CRA PDFs

**Source**: GitHub Issue #156

## Description

## Objective

Replace the current provider information model with the required legal company fields, make them editable from Settings, and display them in generated CRA PDFs.

## Required provider fields

- Raison sociale
- SIRET
- Adresse
- Code postal
- Ville
- Pays

## Requirements

- Remove provider fields that are no longer relevant from the data model, API payloads, forms, and PDF rendering.
- Add the six required fields to the provider model and persistence layer.
- Provide any required migration for existing installations without breaking startup.
- Add editable inputs for all fields in the Settings page.
- Load existing saved values when opening Settings.
- Validate required formats where appropriate, especially SIRET and postal code, without applying overly restrictive country-specific validation to non-French addresses.
- Save updates through the existing provider/settings API.
- Add provider legal information to the CRA PDF in a clear, professional area, preferably in the document header or identity block.
- Ensure long company names and addresses wrap correctly without breaking the A4 layout.
- Avoid displaying obsolete provider fields anywhere after migration.

## Acceptance criteria

- The provider can edit and persist raison sociale, SIRET, address, postal code, city, and country from Settings.
- Saved values are restored after a page refresh and application restart.
- Generated CRA PDFs contain the saved provider legal information.
- Obsolete provider fields are removed from the Settings UI and PDF.
- Existing data migration is handled safely.
- The PDF remains readable and correctly laid out when values are long or partially missing.