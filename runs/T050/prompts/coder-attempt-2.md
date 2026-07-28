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


# T050 — Add editable client and client-contact settings

**Source**: GitHub Issue #95

## Description

## Context
Client and client-contact information is required on the CRA and PDF but cannot currently be modified from the application.

## Goal
Allow the user to configure the client organisation and signing contact used for new monthly CRAs.

## Description
Add persistent client settings with a backend API and frontend form. Support at least client company name, postal address, contact full name, contact role, contact email, and any existing client fields rendered in the PDF.

New CRAs must copy the current client settings. Validated historical CRAs must preserve their captured client information even when the default client settings later change.

## Out of Scope
- Managing several clients or missions.
- CRM functionality.
- Automatically importing contacts from external services.

## Acceptance Criteria
- [ ] A settings screen allows client and contact details to be viewed and edited.
- [ ] Contact email and required fields are validated.
- [ ] Changes persist after reload and backend restart.
- [ ] New CRAs use the current client settings.
- [ ] Validated historical CRAs retain their original client details.
- [ ] The configured contact is available to the future client-signature workflow.
- [ ] Backend and frontend tests cover update, validation, persistence, and snapshot behaviour.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

Implementation is complete. Here's a summary of what was done:

---

## Changes Summary

### Backend — New files

| File | Purpose |
|---|---|
| `com/timizerlike/backend/settings/ClientSettings.java` | JPA entity (singleton id=1), 5 fields |
| `ClientSettingsRepository.java` | `JpaRepository<ClientSettings, Long>` |
| `ClientSettingsDto.java` | Record with `@NotBlank` / `@Email` validation |
| `ClientSettingsService.java` | `get()` (seeds from YAML on first access), `update()` |
| `ClientSettingsController.java` | `GET /api/settings/client`, `PUT /api/settings/client` |
| `ClientSettingsControllerTest.java` | 4 tests: GET returns seeded values; PUT persists; invalid email → 400; blank field → 400 |
| `MonthlyCraCreationServiceClientSettingsTest.java` | New CRA uses current settings; snapshot preserved after settings change |

### Backend — Modified files

| File | Change |
|---|---|
| `TimizerLikeApplication.java` | Extended `@EntityScan` and `@EnableJpaRepositories` to include settings package |
| `MonthlyCraReport.java` | Added nullable `clientAddress` and `clientContactRole` columns + constructor args + getters/setters |
| `CraDetailsDto.java` | Added `clientAddress` and `clientContactRole` fields |
| `CraDetailsMapper.java` | Maps new fields from entity to DTO |
| `CraDayUpdateService.java` | Maps new fields in `buildDto()` |
| `MonthlyCraCreationService.java` | Now uses `ClientSettingsService.get()` for all client fields; `CraDefaultsProperties` retained for provider fields only |
| 7 broken test files | Fixed stale 8-arg and 10-arg `MonthlyCraReport`/`CraDetailsDto` constructors |

### Frontend — New files

| File | Purpose |
|---|---|
| `src/types/settings.ts` | `ClientSettingsDto` interface |
| `src/api/settingsClient.ts` | `getClientSettings()` / `updateClientSettings()` |
| `src/components/ClientSettingsForm/ClientSettingsForm.tsx` | Controlled form with client-side required + email validation |
| `ClientSettingsForm.css` | Form styles |
| `ClientSettingsForm.test.tsx` | 4 tests: pre-fills values; blocks blank save; blocks invalid email; valid submit calls API |

### Frontend — Modified files

| File | Change |
|---|---|
| `src/api/httpClient.ts` | Added `apiPut<T>()` |
| `src/components/AppShell/AppShell.tsx` | Added `'settings'` to view type; "Settings" nav button |
| `src/App.tsx` | Settings view renders `ClientSettingsForm`; loads settings on first visit |

**Test results:** 122/122 backend tests pass; 4/4 new frontend tests pass (2 pre-existing failures from unrelated broken imports remain).

---

## Review

Now I have all the context needed to write the review.

---

## PR Review — T050: Add Editable Client and Client-Contact Settings

### Résumé

L'implémentation couvre tous les critères d'acceptabilité par le chemin actif (`MonthlyCraCreationService` → `ClientSettingsService` → DB). Le backend Spring Boot ajoute un endpoint CRUD `GET/PUT /api/settings/client`, le frontend expose un formulaire avec validation double-couche. La logique de snapshot est architecturalement correcte. Un problème bloquant est identifié : `CraCreationService` (paquet `com.timizerlike.cra.service`) est présent dans le diff, annoté `@Service`, mais n'a pas été mis à jour pour utiliser `ClientSettingsService`.

---

### Vérifications effectuées

- Lecture de tous les fichiers source du diff (backend + frontend)
- Traçage du chemin actif de création de CRA : `CraController` → `MonthlyCraCreationService` → `ClientSettingsService`
- Vérification de l'entité `MonthlyCraReport` : champs `clientAddress` et `clientContactRole` ajoutés et mappés
- Lecture du mapper `CraDetailsMapper.toDto()` : les deux nouveaux champs sont correctement inclus
- Lecture des tests backend et frontend
- Lecture de `TimizerLikeApplication` : `@EntityScan` et `@EnableJpaRepositories` étendus au paquet `settings`
- Comparaison des deux services de création de CRA

---

### Points validés

**Backend**
- `ClientSettings` : entité singleton (id=1L) avec 5 colonnes NOT NULL ; pattern JPA conforme
- `ClientSettingsDto` : record Java avec `@NotBlank` sur tous les champs + `@Email` sur `contactEmail`
- `ClientSettingsService.seed()` : peuple la DB au premier appel depuis `CraDefaultsProperties` si aucune ligne n'existe
- `ClientSettingsService.update()` : upsert avec `save()`, transactionnel
- `ClientSettingsController` : `GET /api/settings/client` et `PUT /api/settings/client` avec `@Valid`
- `MonthlyCraCreationService.buildReport()` : appelle `clientSettingsService.get()` et capture les champs au moment de la création → snapshot correct
- Scission du nom (`splitName()`) : gère null, blank, sans espace
- Tests : 4 tests controller (mock), 2 tests snapshot (unit mock)

**Frontend**
- Formulaire avec 5 champs, labels accessibles, `aria-invalid`, bouton désactivé pendant la sauvegarde
- Validation côté client : champs requis + regex email avant l'appel API
- `App.tsx` : chargement lazy des settings au premier affichage de la vue, `initialValues` transmis au formulaire
- `AppShell` : bouton de navigation "Client Settings" avec `aria-current="page"`
- Tests : 4 tests (rendu, blank, email invalide, soumission valide)

---

### Problèmes détectés

#### 🔴 BLOQUANT — `CraCreationService` non mis à jour dans le diff

**Fichier** : `backend/src/main/java/com/timizerlike/cra/service/CraCreationService.java`

Ce fichier figure dans le diff de T050. Il est annoté `@Service` (bean Spring actif) et son `createForMonth()` lit uniquement `CraDefaultsProperties` — il n'appelle pas `ClientSettingsService`. Son test `CraCreationServiceTest` valide ce comportement sans `ClientSettingsService`.

Bien qu'aucun contrôleur actuel ne l'injecte (le chemin actif utilise `MonthlyCraCreationService`), ce service :
- Est un bean Spring enregistré au démarrage
- Contradite l'intent architectural du ticket
- Constitue un piège pour le développeur suivant qui câblerait ce service à un contrôleur
- Rend le test `CraCreationServiceTest` trompeur vis-à-vis des critères T050

**Correction attendue** : supprimer `CraCreationService` et `CraCreationServiceTest` (dead code), ou les mettre à jour pour injecter `ClientSettingsService`.

---

#### 🟡 OBSERVATION — Test snapshot superficiel

**Fichier** : `MonthlyCraCreationServiceClientSettingsTest#savedCraRetainsClientFieldsAfterSettingsChange`

Le test vérifie l'immuabilité d'un record Java en mémoire (`firstCra.clientCompany() == "Old Corp"` après changement du mock), mais ne simule pas un rechargement depuis la base de données. La garantie de snapshot est architecturalement solide (colonnes stockées sur l'entité), mais le test ne couvre pas le chemin DB → `CraDetailsMapper.toDto()` avec de nouvelles settings actives. Non bloquant, mais la valeur du test est limitée.

---

#### 🟡 OBSERVATION — Erreur silencieuse sur le chargement des settings

**Fichier** : `frontend/src/App.tsx`, ligne 41

```ts
getClientSettings().then(setClientSettings).catch(() => {});
```

Si le fetch échoue, `clientSettings` reste `null` et le formulaire n'est jamais affiché. L'utilisateur voit une page vide sans message d'erreur. UX dégradée mais non bloquante pour le workflow.

---

#### 🟡 OBSERVATION — `contactRole` seedé en dur

**Fichier** : `ClientSettingsService.java`, ligne 49

```java
s.setContactRole("Contact");
```

Les autres champs de seed proviennent de `CraDefaultsProperties`, mais `contactRole` est codé en dur. Comportement divergent mineur ; l'utilisateur peut le modifier depuis le formulaire.

---

### Risques éventuels

- **Backward compatibility DB** : `client_address` et `client_contact_role` sont ajoutés nullable sur `monthly_cra_report`. Les CRAs existantes auront `NULL` pour ces colonnes. Le mapping `CraDetailsMapper` les retourne tels quels (pas de fallback). Si le PDF generator les utilise sans null-check, un NPE est possible sur les anciens CRAs. À vérifier.
- **Seeding concurrent** : `ClientSettingsService.get()` peut théoriquement être appelé simultanément par deux requêtes avant que la ligne `id=1` n'existe, causant une tentative de double insertion. L'annotation `@Transactional` atténue le risque, mais ne le supprime pas entièrement sur SQLite sans isolation explicite.

---

### Décision

L'implémentation remplit les critères fonctionnels. Un service Spring actif dans le diff (`CraCreationService`) n'a pas été mis à jour pour utiliser `ClientSettingsService`, créant une incohérence architecturale et un risque de régression future.

**Actions demandées :**
1. Supprimer `CraCreationService.java` et `CraCreationServiceTest.java` (si dead code confirmé), ou les mettre à jour pour injecter et utiliser `ClientSettingsService`
2. (Optionnel) Afficher un message d'erreur dans `App.tsx` si le chargement des settings échoue
3. (Optionnel) Ajouter un test d'intégration ou de persistence qui charge un CRA depuis la DB après changement de settings pour valider le snapshot end-to-end

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T050/reviews/implementation-review.md
- generated at: 2026-07-28T06:36:37Z

---

Now I have all the context needed to write the review.

---

## PR Review — T050: Add Editable Client and Client-Contact Settings

### Résumé

L'implémentation couvre tous les critères d'acceptabilité par le chemin actif (`MonthlyCraCreationService` → `ClientSettingsService` → DB). Le backend Spring Boot ajoute un endpoint CRUD `GET/PUT /api/settings/client`, le frontend expose un formulaire avec validation double-couche. La logique de snapshot est architecturalement correcte. Un problème bloquant est identifié : `CraCreationService` (paquet `com.timizerlike.cra.service`) est présent dans le diff, annoté `@Service`, mais n'a pas été mis à jour pour utiliser `ClientSettingsService`.

---

### Vérifications effectuées

- Lecture de tous les fichiers source du diff (backend + frontend)
- Traçage du chemin actif de création de CRA : `CraController` → `MonthlyCraCreationService` → `ClientSettingsService`
- Vérification de l'entité `MonthlyCraReport` : champs `clientAddress` et `clientContactRole` ajoutés et mappés
- Lecture du mapper `CraDetailsMapper.toDto()` : les deux nouveaux champs sont correctement inclus
- Lecture des tests backend et frontend
- Lecture de `TimizerLikeApplication` : `@EntityScan` et `@EnableJpaRepositories` étendus au paquet `settings`
- Comparaison des deux services de création de CRA

---

### Points validés

**Backend**
- `ClientSettings` : entité singleton (id=1L) avec 5 colonnes NOT NULL ; pattern JPA conforme
- `ClientSettingsDto` : record Java avec `@NotBlank` sur tous les champs + `@Email` sur `contactEmail`
- `ClientSettingsService.seed()` : peuple la DB au premier appel depuis `CraDefaultsProperties` si aucune ligne n'existe
- `ClientSettingsService.update()` : upsert avec `save()`, transactionnel
- `ClientSettingsController` : `GET /api/settings/client` et `PUT /api/settings/client` avec `@Valid`
- `MonthlyCraCreationService.buildReport()` : appelle `clientSettingsService.get()` et capture les champs au moment de la création → snapshot correct
- Scission du nom (`splitName()`) : gère null, blank, sans espace
- Tests : 4 tests controller (mock), 2 tests snapshot (unit mock)

**Frontend**
- Formulaire avec 5 champs, labels accessibles, `aria-invalid`, bouton désactivé pendant la sauvegarde
- Validation côté client : champs requis + regex email avant l'appel API
- `App.tsx` : chargement lazy des settings au premier affichage de la vue, `initialValues` transmis au formulaire
- `AppShell` : bouton de navigation "Client Settings" avec `aria-current="page"`
- Tests : 4 tests (rendu, blank, email invalide, soumission valide)

---

### Problèmes détectés

#### 🔴 BLOQUANT — `CraCreationService` non mis à jour dans le diff

**Fichier** : `backend/src/main/java/com/timizerlike/cra/service/CraCreationService.java`

Ce fichier figure dans le diff de T050. Il est annoté `@Service` (bean Spring actif) et son `createForMonth()` lit uniquement `CraDefaultsProperties` — il n'appelle pas `ClientSettingsService`. Son test `CraCreationServiceTest` valide ce comportement sans `ClientSettingsService`.

Bien qu'aucun contrôleur actuel ne l'injecte (le chemin actif utilise `MonthlyCraCreationService`), ce service :
- Est un bean Spring enregistré au démarrage
- Contradite l'intent architectural du ticket
- Constitue un piège pour le développeur suivant qui câblerait ce service à un contrôleur
- Rend le test `CraCreationServiceTest` trompeur vis-à-vis des critères T050

**Correction attendue** : supprimer `CraCreationService` et `CraCreationServiceTest` (dead code), ou les mettre à jour pour injecter `ClientSettingsService`.

---

#### 🟡 OBSERVATION — Test snapshot superficiel

**Fichier** : `MonthlyCraCreationServiceClientSettingsTest#savedCraRetainsClientFieldsAfterSettingsChange`

Le test vérifie l'immuabilité d'un record Java en mémoire (`firstCra.clientCompany() == "Old Corp"` après changement du mock), mais ne simule pas un rechargement depuis la base de données. La garantie de snapshot est architecturalement solide (colonnes stockées sur l'entité), mais le test ne couvre pas le chemin DB → `CraDetailsMapper.toDto()` avec de nouvelles settings actives. Non bloquant, mais la valeur du test est limitée.

---

#### 🟡 OBSERVATION — Erreur silencieuse sur le chargement des settings

**Fichier** : `frontend/src/App.tsx`, ligne 41

```ts
getClientSettings().then(setClientSettings).catch(() => {});
```

Si le fetch échoue, `clientSettings` reste `null` et le formulaire n'est jamais affiché. L'utilisateur voit une page vide sans message d'erreur. UX dégradée mais non bloquante pour le workflow.

---

#### 🟡 OBSERVATION — `contactRole` seedé en dur

**Fichier** : `ClientSettingsService.java`, ligne 49

```java
s.setContactRole("Contact");
```

Les autres champs de seed proviennent de `CraDefaultsProperties`, mais `contactRole` est codé en dur. Comportement divergent mineur ; l'utilisateur peut le modifier depuis le formulaire.

---

### Risques éventuels

- **Backward compatibility DB** : `client_address` et `client_contact_role` sont ajoutés nullable sur `monthly_cra_report`. Les CRAs existantes auront `NULL` pour ces colonnes. Le mapping `CraDetailsMapper` les retourne tels quels (pas de fallback). Si le PDF generator les utilise sans null-check, un NPE est possible sur les anciens CRAs. À vérifier.
- **Seeding concurrent** : `ClientSettingsService.get()` peut théoriquement être appelé simultanément par deux requêtes avant que la ligne `id=1` n'existe, causant une tentative de double insertion. L'annotation `@Transactional` atténue le risque, mais ne le supprime pas entièrement sur SQLite sans isolation explicite.

---

### Décision

L'implémentation remplit les critères fonctionnels. Un service Spring actif dans le diff (`CraCreationService`) n'a pas été mis à jour pour utiliser `ClientSettingsService`, créant une incohérence architecturale et un risque de régression future.

**Actions demandées :**
1. Supprimer `CraCreationService.java` et `CraCreationServiceTest.java` (si dead code confirmé), ou les mettre à jour pour injecter et utiliser `ClientSettingsService`
2. (Optionnel) Afficher un message d'erreur dans `App.tsx` si le chargement des settings échoue
3. (Optionnel) Ajouter un test d'intégration ou de persistence qui charge un CRA depuis la DB après changement de settings pour valider le snapshot end-to-end

IMPLEMENTATION_FIX_REQUIRED