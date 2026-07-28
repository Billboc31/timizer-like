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


# T056 — Add a detailed CRA history view with explicit covered period

**Source**: GitHub Issue #101

## Description

## Context
The CRA history currently does not expose enough information to understand what each archived CRA contains. At minimum, the user must be able to identify the exact covered period and inspect the CRA details before downloading the PDF.

## Goal
Provide a dedicated history detail view for each CRA, with a clear period and complete read-only monthly information.

## Description
Extend the CRA history experience so each history entry can open a detailed read-only view. Display the exact covered period, provider, client, client contact, total worked days, CRA status, provider-signature status, client-signature status, validation date, signature dates when available, and the daily worked values for the month.

The covered period must be shown prominently in a human-readable form such as `1 juillet 2026 – 31 juillet 2026`, while retaining the month and year as the main title. Provide actions to return to history and download the corresponding PDF.

Historical details must come from the CRA snapshot and must not be replaced by current provider or client settings.

## Out of Scope
- Editing an archived or signed CRA.
- Deleting historical CRAs.
- Comparing several CRAs.

## Acceptance Criteria
- [ ] Each history entry opens a dedicated CRA detail view.
- [ ] The exact start and end dates of the covered period are prominently displayed.
- [ ] Provider, client, contact, total, status, validation, and signature information are visible.
- [ ] All days in the covered month and their values are shown read-only.
- [ ] The PDF download action is available when applicable.
- [ ] Historical values come from the CRA snapshot rather than current settings.
- [ ] Loading, missing, and error states are handled.
- [ ] Desktop, mobile, component, and integration tests cover the detail view.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

You've hit your limit · resets 10:30pm (Europe/Paris)

---

## Review

Now I have all the information I need. Let me write the review.

---

# PR Review — T056 — Detailed CRA History View

## Résumé

Implementation adds a `CraHistoryDetail` component with period display, snapshot metadata, read-only calendar, PDF download, and full state handling (loading/error/retry). Navigation is integrated via App.tsx. Test coverage is comprehensive: 19 unit tests, 3 a11y tests, 2 integration tests, 2 E2E tests. All 145 tests pass.

One correctness bug is present in the CalendarGrid integration that requires a fix.

---

## Vérifications effectuées

- Ticket acceptance criteria vs. implementation
- `dtoToCraDetails` mapping in `CraHistoryDetail.tsx`
- `CalendarGrid` read-only contract (lines 86, 130–138, 155–158 of `CalendarGrid.tsx`)
- Navigation flow in `App.tsx`
- Type extensions in `api/types.ts` and `types/cra.ts`
- Error/loading/missing states
- Test coverage strategy

---

## Points validés

- **AC1** — Each history entry opens a dedicated detail view. The "Open" button in `CraHistory.tsx` calls `onOpenDetail`, which sets `view = 'history-detail'` and renders `CraHistoryDetail`. ✓
- **AC2** — Covered period (e.g. `1 juillet 2026 – 31 juillet 2026`) is computed via `coveredPeriod()` and displayed prominently below the month/year title. `coveredPeriod` is exported and tested including leap-year February. ✓
- **AC3** — All required fields displayed: provider name, provider company, client name, client company, client contact, total worked days, status badge, validation date, provider signature date, client signature date. ✓
- **AC4** — Daily values rendered via `CalendarGrid`. `onDayClick` is not passed, which blocks the external-caller path. ✓ (with caveat — see below)
- **AC5** — PDF download button visible only when `cra.status === 'VALIDATED'`. ✓
- **AC6** — Data comes from `getCra(id)` fetched fresh per craId; types extended with optional snapshot fields. ✓
- **AC7** — Loading skeleton, error alert with retry button, and null-craId guard all implemented. ✓
- **AC8** — Component tests (19), axe a11y tests (3), integration tests in `App.test.tsx` (2), viewport tests (2), E2E spec (2). ✓
- **App shell** — `shellView` remaps `'history-detail'` → `'history'` so the nav highlight stays on History during detail view. ✓
- **Accessibility** — Semantic HTML (`header`, `section`, `dl/dt/dd`), ARIA labels on skeleton, error `role="alert"`, `aria-hidden` on decorative icons, focus-visible styles. ✓

---

## Problèmes détectés

### [BLOQUANT] `dtoToCraDetails` hardcode `status: 'VALIDATED'` — double impact

**Fichier** : `CraHistoryDetail.tsx:40`

```typescript
function dtoToCraDetails(dto: CraDetailsDto): CraDetails {
  return {
    ...
    status: 'VALIDATED',   // ← hardcodé
    ...
  };
}
```

Ce hardcode a deux effets dans `CalendarGrid` (lignes 86, 130, 155) :

1. **Impact visuel** : `const isValidated = cra.status === 'VALIDATED'` → les cellules reçoivent la classe `day-cell--disabled` et perdent `role="button"` / `tabIndex=0`. Un CRA DRAFT affiché dans l'historique apparaît visuellement comme VALIDATED dans le calendrier.

2. **Masque un gap d'architecture** : sans ce hardcode, si `status === 'DRAFT'` et qu'aucun `onDayClick` n'est passé, `CalendarGrid` tomberait sur son handler interne `handleDayClickInternal` (ligne 137) et appellerait silencieusement `updateDay(cra.id, ...)`, mutant le CRA depuis la vue read-only. Le hardcode évite ce bug par accident, pas par conception.

**Fix attendu** : utiliser `dto.status` dans `dtoToCraDetails`, et neutraliser les interactions internes de CalendarGrid proprement. La solution la plus simple sans modifier CalendarGrid : passer un no-op explicite comme `onDayClick`.

```typescript
// dans CraHistoryDetail.tsx, le rendu CalendarGrid :
<CalendarGrid
  cra={dtoToCraDetails(cra)}   // dtoToCraDetails utilise dto.status
  loading={false}
  error={null}
  onDayClick={() => undefined}  // neutralise handleDayClickInternal sans bloquer l'interactivité visuelle
/>
```

Et dans `dtoToCraDetails` :
```typescript
status: dto.status,  // au lieu de 'VALIDATED'
```

---

## Risques éventuels

- **Dépendance backend** : les champs snapshot (`providerFirstName`, etc.) sont optionnels dans `CraDetailsDto`. Si le backend ne les retourne pas encore pour les CRAs archivés, tous ces champs afficheront `—`. Cela serait silencieux et non bloquant côté UI, mais représenterait une feature partiellement non fonctionnelle. À valider avec le backend.

- **Cohérence langue** : `CraHistory.tsx` utilise l'anglais ("Open", "Download PDF", "Days:") tandis que `CraHistoryDetail.tsx` utilise le français. `CraHistory.tsx` étant un fichier préexistant non dans le scope de ce ticket, cette incohérence est héritée. Non bloquant.

- **Bouton Réessayer non stylé** : dans l'état d'erreur, le bouton `Réessayer` est un `<button>` brut sans classe CSS. Les autres boutons utilisent `cra-detail__btn`. Cosmétique mineur.

---

## Décision

L'implémentation est complète sur tous les critères d'acceptation. Un bug de correctness est confirmé : le hardcode `status: 'VALIDATED'` dans `dtoToCraDetails` produit une représentation visuelle incorrecte pour les CRAs DRAFT et masque un gap dans le contrat read-only de CalendarGrid. Le fix est localisé (3 lignes) et ne remet pas en cause l'architecture.

## Actions demandées

1. Dans `dtoToCraDetails` (`CraHistoryDetail.tsx:40`), remplacer `status: 'VALIDATED'` par `status: dto.status`.
2. Dans le rendu `CalendarGrid` (`CraHistoryDetail.tsx:195-199`), ajouter `onDayClick={() => undefined}` pour neutraliser explicitement les mutations internes de CalendarGrid.
3. Mettre à jour le test "shows calendar grid in read-only mode" si nécessaire pour vérifier que les cellules weekday ont `role="button"` mais qu'aucune mutation n'est déclenchée au clic.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T056/reviews/implementation-review.md
- generated at: 2026-07-28T18:40:35Z

---

Now I have all the information I need. Let me write the review.

---

# PR Review — T056 — Detailed CRA History View

## Résumé

Implementation adds a `CraHistoryDetail` component with period display, snapshot metadata, read-only calendar, PDF download, and full state handling (loading/error/retry). Navigation is integrated via App.tsx. Test coverage is comprehensive: 19 unit tests, 3 a11y tests, 2 integration tests, 2 E2E tests. All 145 tests pass.

One correctness bug is present in the CalendarGrid integration that requires a fix.

---

## Vérifications effectuées

- Ticket acceptance criteria vs. implementation
- `dtoToCraDetails` mapping in `CraHistoryDetail.tsx`
- `CalendarGrid` read-only contract (lines 86, 130–138, 155–158 of `CalendarGrid.tsx`)
- Navigation flow in `App.tsx`
- Type extensions in `api/types.ts` and `types/cra.ts`
- Error/loading/missing states
- Test coverage strategy

---

## Points validés

- **AC1** — Each history entry opens a dedicated detail view. The "Open" button in `CraHistory.tsx` calls `onOpenDetail`, which sets `view = 'history-detail'` and renders `CraHistoryDetail`. ✓
- **AC2** — Covered period (e.g. `1 juillet 2026 – 31 juillet 2026`) is computed via `coveredPeriod()` and displayed prominently below the month/year title. `coveredPeriod` is exported and tested including leap-year February. ✓
- **AC3** — All required fields displayed: provider name, provider company, client name, client company, client contact, total worked days, status badge, validation date, provider signature date, client signature date. ✓
- **AC4** — Daily values rendered via `CalendarGrid`. `onDayClick` is not passed, which blocks the external-caller path. ✓ (with caveat — see below)
- **AC5** — PDF download button visible only when `cra.status === 'VALIDATED'`. ✓
- **AC6** — Data comes from `getCra(id)` fetched fresh per craId; types extended with optional snapshot fields. ✓
- **AC7** — Loading skeleton, error alert with retry button, and null-craId guard all implemented. ✓
- **AC8** — Component tests (19), axe a11y tests (3), integration tests in `App.test.tsx` (2), viewport tests (2), E2E spec (2). ✓
- **App shell** — `shellView` remaps `'history-detail'` → `'history'` so the nav highlight stays on History during detail view. ✓
- **Accessibility** — Semantic HTML (`header`, `section`, `dl/dt/dd`), ARIA labels on skeleton, error `role="alert"`, `aria-hidden` on decorative icons, focus-visible styles. ✓

---

## Problèmes détectés

### [BLOQUANT] `dtoToCraDetails` hardcode `status: 'VALIDATED'` — double impact

**Fichier** : `CraHistoryDetail.tsx:40`

```typescript
function dtoToCraDetails(dto: CraDetailsDto): CraDetails {
  return {
    ...
    status: 'VALIDATED',   // ← hardcodé
    ...
  };
}
```

Ce hardcode a deux effets dans `CalendarGrid` (lignes 86, 130, 155) :

1. **Impact visuel** : `const isValidated = cra.status === 'VALIDATED'` → les cellules reçoivent la classe `day-cell--disabled` et perdent `role="button"` / `tabIndex=0`. Un CRA DRAFT affiché dans l'historique apparaît visuellement comme VALIDATED dans le calendrier.

2. **Masque un gap d'architecture** : sans ce hardcode, si `status === 'DRAFT'` et qu'aucun `onDayClick` n'est passé, `CalendarGrid` tomberait sur son handler interne `handleDayClickInternal` (ligne 137) et appellerait silencieusement `updateDay(cra.id, ...)`, mutant le CRA depuis la vue read-only. Le hardcode évite ce bug par accident, pas par conception.

**Fix attendu** : utiliser `dto.status` dans `dtoToCraDetails`, et neutraliser les interactions internes de CalendarGrid proprement. La solution la plus simple sans modifier CalendarGrid : passer un no-op explicite comme `onDayClick`.

```typescript
// dans CraHistoryDetail.tsx, le rendu CalendarGrid :
<CalendarGrid
  cra={dtoToCraDetails(cra)}   // dtoToCraDetails utilise dto.status
  loading={false}
  error={null}
  onDayClick={() => undefined}  // neutralise handleDayClickInternal sans bloquer l'interactivité visuelle
/>
```

Et dans `dtoToCraDetails` :
```typescript
status: dto.status,  // au lieu de 'VALIDATED'
```

---

## Risques éventuels

- **Dépendance backend** : les champs snapshot (`providerFirstName`, etc.) sont optionnels dans `CraDetailsDto`. Si le backend ne les retourne pas encore pour les CRAs archivés, tous ces champs afficheront `—`. Cela serait silencieux et non bloquant côté UI, mais représenterait une feature partiellement non fonctionnelle. À valider avec le backend.

- **Cohérence langue** : `CraHistory.tsx` utilise l'anglais ("Open", "Download PDF", "Days:") tandis que `CraHistoryDetail.tsx` utilise le français. `CraHistory.tsx` étant un fichier préexistant non dans le scope de ce ticket, cette incohérence est héritée. Non bloquant.

- **Bouton Réessayer non stylé** : dans l'état d'erreur, le bouton `Réessayer` est un `<button>` brut sans classe CSS. Les autres boutons utilisent `cra-detail__btn`. Cosmétique mineur.

---

## Décision

L'implémentation est complète sur tous les critères d'acceptation. Un bug de correctness est confirmé : le hardcode `status: 'VALIDATED'` dans `dtoToCraDetails` produit une représentation visuelle incorrecte pour les CRAs DRAFT et masque un gap dans le contrat read-only de CalendarGrid. Le fix est localisé (3 lignes) et ne remet pas en cause l'architecture.

## Actions demandées

1. Dans `dtoToCraDetails` (`CraHistoryDetail.tsx:40`), remplacer `status: 'VALIDATED'` par `status: dto.status`.
2. Dans le rendu `CalendarGrid` (`CraHistoryDetail.tsx:195-199`), ajouter `onDayClick={() => undefined}` pour neutraliser explicitement les mutations internes de CalendarGrid.
3. Mettre à jour le test "shows calendar grid in read-only mode" si nécessaire pour vérifier que les cellules weekday ont `role="button"` mais qu'aucune mutation n'est déclenchée au clic.

IMPLEMENTATION_FIX_REQUIRED