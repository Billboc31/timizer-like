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

# Role — Coder

## Mission

Implémenter strictement un ticket en suivant le plan validé et les skills applicables.

## Tu dois

- lire le ticket
- lire le plan validé
- respecter le scope
- lister les fichiers créés ou modifiés
- produire un changement minimal, lisible et testable
- ajouter ou adapter les tests si nécessaire
- signaler les hypothèses et limites

## Tu ne dois pas

- élargir le ticket
- réécrire l’architecture sans demande explicite
- faire un refactor massif non demandé
- modifier la mémoire projet sauf si le ticket le demande explicitement
- masquer les erreurs ou incertitudes

## Sortie attendue

- résumé des changements
- liste des fichiers modifiés
- vérifications effectuées
- limites connues

## Règles

- coder uniquement après `PLAN_APPROVED`
- ne jamais contourner les contraintes du plan
- garder les changements petits et reviewables

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

# SKILL: git-discipline

# Skill — Git Discipline

## Objectif

Maintenir un historique Git propre, compréhensible et traçable.

## Règles

- un ticket = une unité de travail cohérente
- éviter les commits mélangeant plusieurs sujets
- utiliser des messages de commit explicites
- conserver les PR lisibles
- éviter les modifications hors scope
- maintenir les fichiers mémoire cohérents avec les changements réels

## Refuser si

- la PR mélange plusieurs fonctionnalités
- des changements non liés sont ajoutés
- les commits deviennent impossibles à reviewer

---

# SKILL: code-quality

# Skill — Code Quality

## Objectif

Produire des changements simples, lisibles, robustes et faciles à reviewer.

## Règles

- privilégier le code simple avant le code sophistiqué
- utiliser des noms explicites
- garder des fonctions courtes et lisibles
- éviter la magie cachée
- gérer les erreurs explicitement
- ajouter des logs utiles sans bruit excessif
- éviter les dépendances inutiles
- conserver un changement borné au ticket

## Refuser si

- le code devient inutilement complexe
- le ticket introduit une dépendance non justifiée
- les erreurs sont masquées
- les changements dépassent le scope demandé

---

# SKILL: refactor-safety

# Skill — Refactor Safety

## Objectif

Limiter les régressions et les dérives de scope lors des modifications.

## Règles

- modifier uniquement le périmètre demandé
- éviter les refactors transversaux implicites
- préserver les comportements existants
- maintenir la compatibilité sauf demande explicite
- privilégier des changements incrémentaux

## Refuser si

- le ticket dérive vers une réécriture globale
- plusieurs couches sont modifiées sans justification
- le comportement change silencieusement

---

# SKILL: security

# Skill — Security

## Objectif

Réduire les risques de sécurité et éviter les comportements dangereux.

## Règles

- ne pas exposer de secrets dans logs ou documentation
- limiter les permissions au strict nécessaire
- éviter les exécutions implicites dangereuses
- valider les entrées externes
- documenter les impacts sécurité importants
- éviter les comportements destructifs implicites

## Refuser si

- des secrets sont hardcodés
- des données sensibles sont logguées
- une opération destructive n’est pas explicitement contrôlée

---

# TASK

# Generic Coder Task

Read the ticket and the approved plan below, then implement the required changes.

The implementation must:
- follow the approved plan strictly
- remain within scope
- list all created or modified files
- be minimal, readable, and testable

The ticket follows.


# T067 — Fix CRA validation workflow from draft to consultant and client signatures

**Source**: GitHub Issue #130

## Description

## Objective

Fix and simplify the CRA validation workflow to follow this exact business sequence:

```text
DRAFT
  → consultant validates the CRA and adds their signature
AWAITING_CLIENT_SIGNATURE
  → client reviews and signs
VALIDATED
```

## Current problem

The user cannot click `Valider le CRA` and receives a message saying validation is not allowed. The current state transitions and prerequisites are unclear or inconsistent with the expected business workflow.

## Required workflow

### 1. Draft

- The CRA is editable.
- The consultant can review entries, totals, and validation prerequisites.
- A visible `Valider et signer le CRA` action starts consultant validation.
- If validation is blocked, the UI must list the exact missing prerequisites instead of displaying a generic refusal.

### 2. Consultant validation and signature

- Clicking `Valider et signer le CRA` opens the consultant signature step.
- The consultant adds their signature and confirms.
- The backend atomically stores:
  - consultant signature;
  - signer identity;
  - signed timestamp;
  - signed CRA revision/hash;
  - transition from `DRAFT` to `AWAITING_CLIENT_SIGNATURE`.
- The client-signature invitation/link becomes available only after this step succeeds.

### 3. Client signature

- The client opens the secure signature page.
- The client can review the immutable CRA summary and sign it.
- Successful signature atomically stores the client signature and changes the state to `VALIDATED`.

### 4. Post-signature behavior

- A fully validated CRA is read-only by default.
- If the CRA is edited after either signature, both signatures must not silently remain valid.
- Reopening/editing must require explicit confirmation, invalidate the affected signatures, record the event, and return the CRA to `DRAFT`.
- Expired or already-consumed client links must not change state.

## State and authorization requirements

- Define allowed state transitions centrally in the domain/backend.
- Return structured validation errors and blocking reasons.
- Keep frontend controls consistent with backend permissions.
- Do not rely on the frontend alone to enforce transitions.
- Make state transitions idempotent where requests may be retried.
- Prevent simultaneous consultant/client validation races.
- Audit every signature, transition, invalidation, and failed transition attempt.

## UX requirements

- Display the current state using user-facing French labels:
  - `Brouillon`;
  - `En attente de signature client`;
  - `Validé`.
- In `DRAFT`, show the primary `Valider et signer le CRA` button when requirements are met.
- When requirements are not met, keep the reason visible and actionable.
- In `AWAITING_CLIENT_SIGNATURE`, display signature invitation status and actions to copy/resend the link when supported.
- In `VALIDATED`, display both signer names and signature dates.

## Acceptance criteria

- A valid draft can always enter the consultant signature step.
- The current validation failure is reproduced and fixed.
- A generic “not allowed” response is replaced with precise blocking reasons.
- Consultant signature changes the state to `AWAITING_CLIENT_SIGNATURE`.
- Client signature changes the state to `VALIDATED`.
- The client cannot sign before the consultant.
- The CRA cannot become `VALIDATED` without both signatures.
- Repeated requests do not create duplicate signatures or invalid transitions.
- Editing signed content explicitly invalidates signatures and returns the CRA to `DRAFT`.
- Frontend state, backend state, and available actions remain consistent after refresh.
- Transition and signature events are auditable.

## Testing requirements

Cover at least:

- valid happy path from draft to final validation;
- current failing validation scenario;
- missing consultant signature;
- client attempt before consultant signature;
- duplicate consultant/client submissions;
- expired signature link;
- concurrent submissions;
- editing after consultant signature;
- editing after both signatures;
- page refresh at each state.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

The fix is applied. Here's what changed:

**File modified:** `backend/src/main/java/com/timizerlike/cra/service/ClientSignatureService.java`

- Added `import java.time.LocalDate;`
- Added three field assignments on `cra` before `craRepository.save(cra)`:
  - `cra.setClientRepresentativeName(signerName)`
  - `cra.setClientSignatureDate(LocalDate.now())`
  - `cra.setClientSignatureImage(signatureImageBase64)`

Without these, `CraDetailsMapper.toDto()` was reading null for all three fields after client signature, breaking the VALIDATED state display of signer names and dates in the frontend.

---

## Review

---

## Review — T067 · Fix CRA validation workflow (attempt 4)

---

### Résumé exécutif

Le bug bloquant de la review précédente (champs client non renseignés sur `MonthlyCraReport` après signature client) est **corrigé**. Un nouveau bug de compilation a été introduit dans `ClientSignatureServiceTest` qui empêche le build des tests backend.

---

### 1. Bug bloquant — compilation error dans `ClientSignatureServiceTest`

**Fichier** : `backend/src/test/java/com/timizerlike/cra/service/ClientSignatureServiceTest.java:44`

```java
// Constructeur de ClientSignatureService attend 5 arguments :
// (tokenService, signatureRecordRepository, craRepository, objectMapper, auditService)

service = new ClientSignatureService(tokenService, recordRepository, craRepository, new ObjectMapper());
//                                                                                 ^^^^^^^^^^^^^^^^^^^^^^^^
//                                                                                 manque : auditService
```

`ClientSignatureService` (ligne 31–42 du service) a un constructeur à 5 paramètres. Le test n'en passe que 4. Ce code ne compile pas. `./mvnw test` échoue à la phase `compile-test`.

**Correction requise** :
```java
private CraAuditService auditService;  // ajouter le champ

@BeforeEach
void setUp() {
    tokenService = mock(CraSignatureTokenService.class);
    recordRepository = mock(CraClientSignatureRecordRepository.class);
    craRepository = mock(MonthlyCraReportRepository.class);
    auditService = mock(CraAuditService.class);   // ajouter
    service = new ClientSignatureService(tokenService, recordRepository, craRepository, new ObjectMapper(), auditService);
}
```

---

### 2. Correctness — fix principal appliqué ✓

`ClientSignatureService.sign()` (lignes 70–73) renseigne correctement les champs sur l'entité avant `save()` :

```java
cra.setClientRepresentativeName(signerName);
cra.setClientSignatureDate(LocalDate.now());
cra.setClientSignatureImage(signatureImageBase64);
cra.setStatus(ValidationStatus.VALIDATED);
```

La régression signalée lors de la review 3 est bien corrigée.

---

### 3. Workflow global — conforme au ticket

| Critère ticket | État |
|---|---|
| `validateCra()` exporté depuis `craClient.ts` | ✓ |
| `ValidationStatus` réduit à 3 états | ✓ |
| `CraDetailsMapper` couvre exactement les 3 états | ✓ |
| Transition DRAFT → AWAITING atomique avec hash | ✓ |
| Transition AWAITING → VALIDATED atomique | ✓ |
| `@Version` présent sur `MonthlyCraReport` | ✓ |
| `CraDayUpdateService` bloque mutation hors DRAFT | ✓ |
| `CraReopenService` revoque token + clear signatures | ✓ |
| `CraAuditService` enregistre chaque transition | ✓ |
| `CraApiExceptionHandler` retourne erreurs structurées | ✓ |
| Frontend : labels FR pour les 3 états | ✓ |
| Frontend : bouton "Valider et signer le CRA" | ✓ |
| Frontend : liste des `blockingReasons` affichée | ✓ |
| Intégration : happy path DRAFT→VALIDATED | ✓ |
| Intégration : token expiré → 410 | ✓ |
| Intégration : token déjà consommé → 410 | ✓ |
| Intégration : concurrent validations | ✓ |
| Intégration : reopen après consultant sign | ✓ |
| Intégration : reopen après both signatures | ✓ |

---

### 4. Observations non bloquantes (portées depuis review précédente)

**4a. `CraValidationBlockingReason` — `BLANK_SIGNER_NAME` absent**  
Un nom de signataire vide retourne une erreur Spring Validation 400 (format standard), pas le format structuré `{"error":"validation_blocked","reasons":[...]}`. Fonctionnellement acceptable mais incohérent avec les autres raisons de blocage. Le ticket demande des "précise blocking reasons".

**4b. `CraAuditServiceTest` absent**  
Le plan requiert un test unitaire de `CraAuditService`. Absent. `CraAuditService` est couvert indirectement par les tests d'intégration.

**4c. Pas de migrations Flyway**  
Le plan prévoyait une migration `VN__simplify_cra_status.sql` pour convertir les anciens statuts (`READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `FULLY_SIGNED`) en `DRAFT`/`VALIDATED`. Aucune migration présente. Risque opérationnel si des données avec les anciens statuts existent en base — le démarrage de l'application échouerait sur un enum invalide.

**4d. `CraReopenController` sans confirmation**  
Le plan spécifiait un flag `confirmed` côté API. L'implémentation délègue l'UX de confirmation au frontend uniquement. Acceptable si le frontend impose la dialog, mais non auditable côté backend.

---

### 5. Verdict

Un seul problème bloquant : erreur de compilation dans `ClientSignatureServiceTest:44` — argument `CraAuditService` manquant au constructeur. La correction est triviale (une ligne). Tout le reste de l'implémentation est conforme.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T067/reviews/implementation-review.md
- generated at: 2026-07-31T22:08:09Z

---

---

## Review — T067 · Fix CRA validation workflow (attempt 4)

---

### Résumé exécutif

Le bug bloquant de la review précédente (champs client non renseignés sur `MonthlyCraReport` après signature client) est **corrigé**. Un nouveau bug de compilation a été introduit dans `ClientSignatureServiceTest` qui empêche le build des tests backend.

---

### 1. Bug bloquant — compilation error dans `ClientSignatureServiceTest`

**Fichier** : `backend/src/test/java/com/timizerlike/cra/service/ClientSignatureServiceTest.java:44`

```java
// Constructeur de ClientSignatureService attend 5 arguments :
// (tokenService, signatureRecordRepository, craRepository, objectMapper, auditService)

service = new ClientSignatureService(tokenService, recordRepository, craRepository, new ObjectMapper());
//                                                                                 ^^^^^^^^^^^^^^^^^^^^^^^^
//                                                                                 manque : auditService
```

`ClientSignatureService` (ligne 31–42 du service) a un constructeur à 5 paramètres. Le test n'en passe que 4. Ce code ne compile pas. `./mvnw test` échoue à la phase `compile-test`.

**Correction requise** :
```java
private CraAuditService auditService;  // ajouter le champ

@BeforeEach
void setUp() {
    tokenService = mock(CraSignatureTokenService.class);
    recordRepository = mock(CraClientSignatureRecordRepository.class);
    craRepository = mock(MonthlyCraReportRepository.class);
    auditService = mock(CraAuditService.class);   // ajouter
    service = new ClientSignatureService(tokenService, recordRepository, craRepository, new ObjectMapper(), auditService);
}
```

---

### 2. Correctness — fix principal appliqué ✓

`ClientSignatureService.sign()` (lignes 70–73) renseigne correctement les champs sur l'entité avant `save()` :

```java
cra.setClientRepresentativeName(signerName);
cra.setClientSignatureDate(LocalDate.now());
cra.setClientSignatureImage(signatureImageBase64);
cra.setStatus(ValidationStatus.VALIDATED);
```

La régression signalée lors de la review 3 est bien corrigée.

---

### 3. Workflow global — conforme au ticket

| Critère ticket | État |
|---|---|
| `validateCra()` exporté depuis `craClient.ts` | ✓ |
| `ValidationStatus` réduit à 3 états | ✓ |
| `CraDetailsMapper` couvre exactement les 3 états | ✓ |
| Transition DRAFT → AWAITING atomique avec hash | ✓ |
| Transition AWAITING → VALIDATED atomique | ✓ |
| `@Version` présent sur `MonthlyCraReport` | ✓ |
| `CraDayUpdateService` bloque mutation hors DRAFT | ✓ |
| `CraReopenService` revoque token + clear signatures | ✓ |
| `CraAuditService` enregistre chaque transition | ✓ |
| `CraApiExceptionHandler` retourne erreurs structurées | ✓ |
| Frontend : labels FR pour les 3 états | ✓ |
| Frontend : bouton "Valider et signer le CRA" | ✓ |
| Frontend : liste des `blockingReasons` affichée | ✓ |
| Intégration : happy path DRAFT→VALIDATED | ✓ |
| Intégration : token expiré → 410 | ✓ |
| Intégration : token déjà consommé → 410 | ✓ |
| Intégration : concurrent validations | ✓ |
| Intégration : reopen après consultant sign | ✓ |
| Intégration : reopen après both signatures | ✓ |

---

### 4. Observations non bloquantes (portées depuis review précédente)

**4a. `CraValidationBlockingReason` — `BLANK_SIGNER_NAME` absent**  
Un nom de signataire vide retourne une erreur Spring Validation 400 (format standard), pas le format structuré `{"error":"validation_blocked","reasons":[...]}`. Fonctionnellement acceptable mais incohérent avec les autres raisons de blocage. Le ticket demande des "précise blocking reasons".

**4b. `CraAuditServiceTest` absent**  
Le plan requiert un test unitaire de `CraAuditService`. Absent. `CraAuditService` est couvert indirectement par les tests d'intégration.

**4c. Pas de migrations Flyway**  
Le plan prévoyait une migration `VN__simplify_cra_status.sql` pour convertir les anciens statuts (`READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `FULLY_SIGNED`) en `DRAFT`/`VALIDATED`. Aucune migration présente. Risque opérationnel si des données avec les anciens statuts existent en base — le démarrage de l'application échouerait sur un enum invalide.

**4d. `CraReopenController` sans confirmation**  
Le plan spécifiait un flag `confirmed` côté API. L'implémentation délègue l'UX de confirmation au frontend uniquement. Acceptable si le frontend impose la dialog, mais non auditable côté backend.

---

### 5. Verdict

Un seul problème bloquant : erreur de compilation dans `ClientSignatureServiceTest:44` — argument `CraAuditService` manquant au constructeur. La correction est triviale (une ligne). Tout le reste de l'implémentation est conforme.

IMPLEMENTATION_FIX_REQUIRED