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


# T049 — Add editable provider profile settings

**Source**: GitHub Issue #94

## Description

## Context
Provider information currently appears in the CRA and generated PDF but cannot be modified from the application.

## Goal
Allow the user to manage the provider identity and company information used for future CRAs and PDFs.

## Description
Add a provider settings model, persistence, backend API, and frontend form. Support at least provider full name, company name, postal address, email, phone, and any existing provider fields already rendered in the PDF.

Saved provider settings must be used when creating a new monthly CRA. Historical validated CRAs must preserve the values captured at validation time and must not silently change when settings are edited later.

## Out of Scope
- Multiple provider accounts.
- Authentication and role management.
- Legal company verification.

## Acceptance Criteria
- [ ] A dedicated settings screen allows provider information to be viewed and edited.
- [ ] Required fields are validated with clear messages.
- [ ] Changes persist after page reload and backend restart.
- [ ] New CRAs use the current provider settings.
- [ ] Previously validated CRA PDFs retain their original provider information.
- [ ] Save, loading, success, and failure states are handled.
- [ ] Backend and frontend tests cover reading, updating, validation, and snapshot behaviour.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

You've hit your limit · resets 12:30pm (Europe/Paris)

---

## Review

Now I have all the information needed. Let me write the review.

---

# Review — T049: Add editable provider profile settings

## Résumé

L'implémentation couvre l'ensemble du périmètre fonctionnel : entité `ProviderSettings`, API REST GET/PUT, service avec seeding depuis les défauts, snapshotting des champs provider dans `MonthlyCraReport` à la création, lecture des champs snapshotés pour la génération PDF, composant React avec validation et états UI. L'architecture garantit correctement l'isolation historique des CRAs.

Un problème bloquant est identifié : le critère d'acceptation « tests couvrent le comportement de snapshot » n'est pas satisfait.

---

## Points validés

**Backend :**
- `ProviderSettings` entity (singleton id=1, champs requis annotés `@NotBlank`/`@Email`, getters/setters)
- `ProviderSettingsRepository` JPA
- `ProviderSettingsDto` record avec annotations Bean Validation
- `ProviderSettingsService` : seeding lazy depuis `CraDefaultsProperties`, update transactionnel, `splitName()` correct
- `ProviderSettingsController` : GET + PUT avec `@Valid @RequestBody`, 400 via Spring's `MethodArgumentNotValidException`
- `MonthlyCraReport` : colonnes snapshot `providerAddress`, `providerEmail`, `providerPhone` ajoutées (nullable), passées via constructeur package-private — pas de setter, immuables après création
- `MonthlyCraCreationService.buildReport()` appelle `providerSettingsService.getSettings()` et passe tous les champs provider au constructeur → snapshot correct
- `CraPdfDownloadService` lit depuis `cra.getProviderAddress()`, `cra.getProviderEmail()` (snapshot) et non depuis `ProviderSettingsService` → préservation historique correcte
- `CraController` utilise bien `MonthlyCraCreationService` (pas l'ancien `CraCreationService`)
- Tests backend : 6 tests service + 3 tests contrôleur, couvrent seeding, update, validation `@NotBlank`

**Frontend :**
- `ProviderSettingsForm` : fetch on mount, loading/saving/success/error states, validation client-side, cancel restaure les valeurs sans appel API, attributs ARIA corrects
- API client : `getProviderSettings()`, `updateProviderSettings()`, `apiPut()` ajouté à `httpClient`
- Navigation : `AppView` étendu, AppShell avec bouton Settings, `aria-current` correct, App.tsx render conditionnel propre
- Tests frontend : 8 tests de composant (tous les états couverts), 2 tests API client pour les nouvelles fonctions

---

## Problèmes détectés

### 🔴 BLOQUANT — Snapshot behaviour non couvert par les tests

Le critère d'acceptation est explicite : **"Backend and frontend tests cover reading, updating, validation, and snapshot behaviour."**

Aucun test ne vérifie que les valeurs provider sont correctement snapshotées dans le `MonthlyCraReport` créé. `MonthlyCraCreationServiceTest` mocke `ProviderSettingsService` mais n'assert pas que les champs provider du CRA créé (`providerFirstName`, `providerLastName`, `providerCompany`, `providerAddress`, `providerEmail`, `providerPhone`) correspondent aux valeurs retournées par le mock.

**Test manquant (exemple minimal) :**
```java
// Dans MonthlyCraCreationServiceTest
@Test
void snapshotsProviderSettingsIntoCreatedCra() {
    // Given
    ProviderSettingsDto settings = new ProviderSettingsDto(
        "Jean", "Dupont", "Acme", "1 rue Test", "jean@acme.com", "0600000000");
    // mock repository + providerSettingsService retournant settings
    
    CraCreationResult result = service.createForMonth(2025, 6);
    
    // Assert provider fields are snapshotted
    assertThat(result.cra().providerFirstName()).isEqualTo("Jean");
    assertThat(result.cra().providerLastName()).isEqualTo("Dupont");
    assertThat(result.cra().providerCompany()).isEqualTo("Acme");
    // etc.
}
```

De même, `CraPdfDownloadServiceTest.validatedCra()` ne stube pas `getProviderAddress()` ni `getProviderEmail()` → le test passe avec null pour ces champs, ne vérifiant pas que les valeurs snapshotées sont bien transmises au document PDF.

---

### 🟡 MINEUR — Code mort : `CraCreationService` non mis à jour

`com.timizerlike.cra.service.CraCreationService` subsiste avec sa propre dépendance à `CraDefaultsProperties` (pas à `ProviderSettingsService`). Il n'est pas utilisé par la chaîne HTTP active (le contrôleur appelle `MonthlyCraCreationService`), mais reste dans le codebase avec son test `CraCreationServiceTest`, ce qui est trompeur.

**Action attendue** : supprimer `CraCreationService` et `CraCreationServiceTest`, ou si nécessaire, les faire migrer vers `ProviderSettingsService`.

---

### 🟡 MINEUR — Validation redondante dans le service

`ProviderSettingsService.updateSettings()` répète les checks `isBlank()` pour les champs déjà protégés par `@Valid @NotBlank` au niveau du contrôleur. Ces branches sont du code mort : elles ne peuvent pas être atteintes par un appel HTTP normal. À supprimer pour clarté.

---

## Risques éventuels

- **Hibernate `ddl-auto: update`** pour les colonnes snapshot : acceptable si c'est l'approche configurée pour ce projet (pas de Flyway/Liquibase), mais fragile en production sur des schémas existants. Non introduit par T049 — déjà en place.
- **`CraDetailsDto`** n'expose pas `providerAddress/email/phone` : acceptable car ces champs ne sont utiles que pour la génération PDF.

---

## Décision

L'architecture du snapshot est correcte et le comportement fonctionnel attendu est implémenté. Cependant, le critère d'acceptation "tests couvrent le comportement de snapshot" n'est pas satisfait — il manque au minimum un test assertant que les champs provider du settings service sont bien snapshotés dans le CRA créé, et un test vérifiant que l'adresse/email provider snapshotés sont bien transmis au PDF.

## Actions demandées

1. **[REQUIS]** Ajouter dans `MonthlyCraCreationServiceTest` un test qui assert explicitement que les valeurs retournées par `ProviderSettingsService.getSettings()` sont présentes dans le `CraDetailsDto` retourné (firstName, lastName, company, address, email, phone).
2. **[REQUIS]** Compléter `CraPdfDownloadServiceTest.validatedCra()` pour stubber `getProviderAddress()` et `getProviderEmail()` avec des valeurs non-null, et asserter que ces valeurs apparaissent dans le `CraPdfDocument` généré.
3. **[RECOMMANDÉ]** Supprimer `CraCreationService` et son test `CraCreationServiceTest` (code mort).
4. **[RECOMMANDÉ]** Supprimer la validation manuelle redondante dans `ProviderSettingsService.updateSettings()`.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T049/reviews/implementation-review.md
- generated at: 2026-07-28T06:48:03Z

---

Now I have all the information needed. Let me write the review.

---

# Review — T049: Add editable provider profile settings

## Résumé

L'implémentation couvre l'ensemble du périmètre fonctionnel : entité `ProviderSettings`, API REST GET/PUT, service avec seeding depuis les défauts, snapshotting des champs provider dans `MonthlyCraReport` à la création, lecture des champs snapshotés pour la génération PDF, composant React avec validation et états UI. L'architecture garantit correctement l'isolation historique des CRAs.

Un problème bloquant est identifié : le critère d'acceptation « tests couvrent le comportement de snapshot » n'est pas satisfait.

---

## Points validés

**Backend :**
- `ProviderSettings` entity (singleton id=1, champs requis annotés `@NotBlank`/`@Email`, getters/setters)
- `ProviderSettingsRepository` JPA
- `ProviderSettingsDto` record avec annotations Bean Validation
- `ProviderSettingsService` : seeding lazy depuis `CraDefaultsProperties`, update transactionnel, `splitName()` correct
- `ProviderSettingsController` : GET + PUT avec `@Valid @RequestBody`, 400 via Spring's `MethodArgumentNotValidException`
- `MonthlyCraReport` : colonnes snapshot `providerAddress`, `providerEmail`, `providerPhone` ajoutées (nullable), passées via constructeur package-private — pas de setter, immuables après création
- `MonthlyCraCreationService.buildReport()` appelle `providerSettingsService.getSettings()` et passe tous les champs provider au constructeur → snapshot correct
- `CraPdfDownloadService` lit depuis `cra.getProviderAddress()`, `cra.getProviderEmail()` (snapshot) et non depuis `ProviderSettingsService` → préservation historique correcte
- `CraController` utilise bien `MonthlyCraCreationService` (pas l'ancien `CraCreationService`)
- Tests backend : 6 tests service + 3 tests contrôleur, couvrent seeding, update, validation `@NotBlank`

**Frontend :**
- `ProviderSettingsForm` : fetch on mount, loading/saving/success/error states, validation client-side, cancel restaure les valeurs sans appel API, attributs ARIA corrects
- API client : `getProviderSettings()`, `updateProviderSettings()`, `apiPut()` ajouté à `httpClient`
- Navigation : `AppView` étendu, AppShell avec bouton Settings, `aria-current` correct, App.tsx render conditionnel propre
- Tests frontend : 8 tests de composant (tous les états couverts), 2 tests API client pour les nouvelles fonctions

---

## Problèmes détectés

### 🔴 BLOQUANT — Snapshot behaviour non couvert par les tests

Le critère d'acceptation est explicite : **"Backend and frontend tests cover reading, updating, validation, and snapshot behaviour."**

Aucun test ne vérifie que les valeurs provider sont correctement snapshotées dans le `MonthlyCraReport` créé. `MonthlyCraCreationServiceTest` mocke `ProviderSettingsService` mais n'assert pas que les champs provider du CRA créé (`providerFirstName`, `providerLastName`, `providerCompany`, `providerAddress`, `providerEmail`, `providerPhone`) correspondent aux valeurs retournées par le mock.

**Test manquant (exemple minimal) :**
```java
// Dans MonthlyCraCreationServiceTest
@Test
void snapshotsProviderSettingsIntoCreatedCra() {
    // Given
    ProviderSettingsDto settings = new ProviderSettingsDto(
        "Jean", "Dupont", "Acme", "1 rue Test", "jean@acme.com", "0600000000");
    // mock repository + providerSettingsService retournant settings
    
    CraCreationResult result = service.createForMonth(2025, 6);
    
    // Assert provider fields are snapshotted
    assertThat(result.cra().providerFirstName()).isEqualTo("Jean");
    assertThat(result.cra().providerLastName()).isEqualTo("Dupont");
    assertThat(result.cra().providerCompany()).isEqualTo("Acme");
    // etc.
}
```

De même, `CraPdfDownloadServiceTest.validatedCra()` ne stube pas `getProviderAddress()` ni `getProviderEmail()` → le test passe avec null pour ces champs, ne vérifiant pas que les valeurs snapshotées sont bien transmises au document PDF.

---

### 🟡 MINEUR — Code mort : `CraCreationService` non mis à jour

`com.timizerlike.cra.service.CraCreationService` subsiste avec sa propre dépendance à `CraDefaultsProperties` (pas à `ProviderSettingsService`). Il n'est pas utilisé par la chaîne HTTP active (le contrôleur appelle `MonthlyCraCreationService`), mais reste dans le codebase avec son test `CraCreationServiceTest`, ce qui est trompeur.

**Action attendue** : supprimer `CraCreationService` et `CraCreationServiceTest`, ou si nécessaire, les faire migrer vers `ProviderSettingsService`.

---

### 🟡 MINEUR — Validation redondante dans le service

`ProviderSettingsService.updateSettings()` répète les checks `isBlank()` pour les champs déjà protégés par `@Valid @NotBlank` au niveau du contrôleur. Ces branches sont du code mort : elles ne peuvent pas être atteintes par un appel HTTP normal. À supprimer pour clarté.

---

## Risques éventuels

- **Hibernate `ddl-auto: update`** pour les colonnes snapshot : acceptable si c'est l'approche configurée pour ce projet (pas de Flyway/Liquibase), mais fragile en production sur des schémas existants. Non introduit par T049 — déjà en place.
- **`CraDetailsDto`** n'expose pas `providerAddress/email/phone` : acceptable car ces champs ne sont utiles que pour la génération PDF.

---

## Décision

L'architecture du snapshot est correcte et le comportement fonctionnel attendu est implémenté. Cependant, le critère d'acceptation "tests couvrent le comportement de snapshot" n'est pas satisfait — il manque au minimum un test assertant que les champs provider du settings service sont bien snapshotés dans le CRA créé, et un test vérifiant que l'adresse/email provider snapshotés sont bien transmis au PDF.

## Actions demandées

1. **[REQUIS]** Ajouter dans `MonthlyCraCreationServiceTest` un test qui assert explicitement que les valeurs retournées par `ProviderSettingsService.getSettings()` sont présentes dans le `CraDetailsDto` retourné (firstName, lastName, company, address, email, phone).
2. **[REQUIS]** Compléter `CraPdfDownloadServiceTest.validatedCra()` pour stubber `getProviderAddress()` et `getProviderEmail()` avec des valeurs non-null, et asserter que ces valeurs apparaissent dans le `CraPdfDocument` généré.
3. **[RECOMMANDÉ]** Supprimer `CraCreationService` et son test `CraCreationServiceTest` (code mort).
4. **[RECOMMANDÉ]** Supprimer la validation manuelle redondante dans `ProviderSettingsService.updateSettings()`.

IMPLEMENTATION_FIX_REQUIRED