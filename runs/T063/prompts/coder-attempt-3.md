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


# T063 — Move application navigation to a responsive left sidebar

**Source**: GitHub Issue #121

## Description

## Objective

Replace the current top navigation with a modern, persistent left sidebar that becomes the primary application navigation.

## Context

The application navigation should support the new global CRA overview and the dedicated `New CRA` action while leaving more horizontal structure and clearer hierarchy for future features.

## Requirements

- Replace the current top navigation bar with a vertical sidebar on the left.
- Move all existing navigation destinations and actions into the sidebar.
- Include a prominent `New CRA` action that can open the CRA period-selection dialog.
- Include navigation to the global CRA overview/home page.
- Clearly indicate the active route.
- Keep the sidebar visible on desktop while the main content scrolls independently where appropriate.
- Provide a responsive mobile/tablet behavior, such as a collapsible drawer.
- Preserve access to account, settings, logout, and other existing navigation actions.
- Ensure the sidebar does not cover or shrink the main content beyond usable dimensions.
- Use semantic controls, keyboard navigation, visible focus states, and accessible labels.

## Design expectations

- Modern and compact visual design.
- Clear hierarchy between the primary creation action and navigation links.
- Consistent icon and label alignment.
- Optional collapsed desktop mode is acceptable but not required.

## Acceptance criteria

- The top navigation is replaced by a left sidebar on desktop.
- All previously accessible navigation actions remain available.
- The current page is visually identifiable in the sidebar.
- The `New CRA` action is available from the sidebar.
- The layout works on common desktop, tablet, and mobile viewport sizes.
- Keyboard-only users can access every sidebar action.
- Existing routes and deep links continue to work.

## Dependencies

- Must support the new CRA period-selection dialog.
- Must link to the global CRA calendar overview.

## Out of scope

- Redesigning the content of every application page.
- User-configurable sidebar ordering.
- Role-based menu customization.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

All three review issues are fixed in `AppSidebar.tsx`:

1. **[BLOQUANT] `inert` on closed mobile drawer** — added `isMobile` state via `matchMedia('(max-width: 767px)')` so `inert` is only applied when `isMobile && !isOpen`. This correctly blocks keyboard/screen-reader access to off-screen elements without touching the always-visible desktop sidebar.

2. **[BLOQUANT] `role="dialog"` + `aria-modal`** — added conditionally when `isMobile && isOpen`, with `aria-label="Navigation menu"` to give the dialog an accessible name.

3. **[MINEUR] Focus on open** — the `useEffect` that runs when `isOpen` becomes true now immediately moves focus to the first enabled button in the drawer before attaching the keydown listener.

All 278 tests still pass.

---

## Review

# PR Review — T063: Move application navigation to a responsive left sidebar

## Résumé

L'implémentation crée `AppSidebar` (tsx + css) et modifie `AppShell` pour remplacer la barre de navigation horizontale par une sidebar verticale persistante sur desktop et un tiroir modal sur mobile. Le périmètre est strictement borné, le plan est respecté, et les 278 tests existants passent.

## Vérifications effectuées

- Lecture intégrale de `AppSidebar.tsx`, `AppSidebar.css`, `AppShell.tsx`, `AppShell.css`
- Confrontation plan `runs/T063/plan.md` ↔ implémentation effective
- Vérification des critères d'acceptance du ticket
- Audit accessibilité : ARIA, focus management, inert, keyboard trap, rôles

## Points validés

| Critère ticket | Statut |
|---|---|
| Top navigation remplacée par sidebar | ✅ |
| Toutes les destinations de nav présentes (New CRA, History, Paramètres) | ✅ |
| Sidebar visible en permanence sur desktop (220 px, flex row, `height: 100vh`) | ✅ |
| Main content scroll indépendant (`flex: 1; overflow-y: auto; min-width: 0`) | ✅ |
| Route active identifiable (`aria-current="page"` + accent CSS) | ✅ |
| Tiroir mobile (hamburger → drawer overlay 280 px, transition 0.25s) | ✅ |
| `inert` sur la sidebar fermée sur mobile — bloque focus/SR | ✅ |
| `role="dialog"` + `aria-modal="true"` quand tiroir ouvert | ✅ |
| Focus déplacé vers le premier bouton à l'ouverture | ✅ |
| Piège de focus Tab/Shift-Tab actif quand tiroir ouvert | ✅ |
| Escape ferme le tiroir | ✅ |
| Backdrop click ferme le tiroir | ✅ |
| `aria-label` sur tous les éléments interactifs | ✅ |
| `focus-visible` visible sur tous les boutons | ✅ |
| `aria-expanded` sur le bouton hamburger | ✅ |
| Détection de breakpoint JS synchronisée avec CSS (`max-width: 767px`) | ✅ |
| Scope borné — aucune modification de App.tsx, vues, tokens | ✅ |
| 278 tests existants verts | ✅ |

## Problèmes détectés

### 🔴 [BLOQUANT] Focus non retourné au déclencheur après fermeture du tiroir

**Fichiers** : `AppShell.tsx`, `AppSidebar.tsx`

Quand le tiroir se ferme (Escape, clic backdrop, sélection d'un item), `setSidebarOpen(false)` est appelé et l'attribut `inert` est appliqué à la sidebar. Le focus était sur un bouton à l'intérieur de la sidebar — il tombe désormais sur `document.body`. L'utilisateur clavier perd entièrement son contexte de navigation et doit re-parcourir la page depuis le début.

Le pattern ARIA APG Dialog et l'acceptance criterion du ticket ("Keyboard-only users can access every sidebar action") exigent que le focus retourne au déclencheur (bouton hamburger) à la fermeture.

**Correction minimale** — dans `AppShell.tsx` :

```tsx
// Ajouter une ref sur le bouton hamburger
const hamburgerRef = useRef<HTMLButtonElement>(null);

// Retourner le focus quand sidebarOpen passe à false
const prevSidebarOpen = useRef(false);
useEffect(() => {
  if (prevSidebarOpen.current && !sidebarOpen) {
    hamburgerRef.current?.focus();
  }
  prevSidebarOpen.current = sidebarOpen;
}, [sidebarOpen]);

// Appliquer la ref sur le bouton
<button ref={hamburgerRef} ...>☰</button>
```

---

### 🟡 [Observation] `handleNavClick` appelle `onClose()` sur desktop également

**Fichier** : `AppSidebar.tsx:62-65`

`onClose` est toujours appelé, même sur desktop où `sidebarOpen` ne peut jamais être `true`. Le state setter `setSidebarOpen(false)` s'exécute donc inutilement à chaque navigation desktop. C'est sans conséquence fonctionnelle (idempotent) mais légèrement trompeur. Corrigible lors d'un prochain passage si besoin.

---

### 🟡 [Observation] Pas de `aria-controls` sur le hamburger

**Fichier** : `AppShell.tsx:33-40`

`aria-expanded` est présent mais `aria-controls` pointant vers l'id de la sidebar manque. Recommandé par le pattern ARIA APG Button mais non bloquant (le comportement reste compréhensible via `aria-expanded` + l'annonce du `role="dialog"`).

---

### 🟡 [Observation] Pas de scroll-lock sur mobile quand tiroir ouvert

Le contenu de la page reste scrollable derrière le backdrop sur mobile (tactile). Ce n'est pas une régression et ce n'est pas exigé par le ticket, mais c'est une UX courante à prévoir dans un suivi.

## Risques éventuels

- Aucun risque sécurité — le composant est purement UI/navigation, sans données sensibles ni appel externe.
- Le focus drop (issue bloquante) est le seul risque réel d'accessibilité WCAG Level A restant.

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[Obligatoire]** Retourner le focus au bouton hamburger après fermeture du tiroir — cf. correction minimale ci-dessus dans `AppShell.tsx`. Une `ref` sur le bouton hamburger + un `useEffect` sur `sidebarOpen` suffisent.
2. [Optionnel] Ajouter `aria-controls` sur le hamburger pointant vers un `id` ajouté sur la `<aside>`.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T063/reviews/implementation-review.md
- generated at: 2026-07-29T18:24:10Z

---

# PR Review — T063: Move application navigation to a responsive left sidebar

## Résumé

L'implémentation crée `AppSidebar` (tsx + css) et modifie `AppShell` pour remplacer la barre de navigation horizontale par une sidebar verticale persistante sur desktop et un tiroir modal sur mobile. Le périmètre est strictement borné, le plan est respecté, et les 278 tests existants passent.

## Vérifications effectuées

- Lecture intégrale de `AppSidebar.tsx`, `AppSidebar.css`, `AppShell.tsx`, `AppShell.css`
- Confrontation plan `runs/T063/plan.md` ↔ implémentation effective
- Vérification des critères d'acceptance du ticket
- Audit accessibilité : ARIA, focus management, inert, keyboard trap, rôles

## Points validés

| Critère ticket | Statut |
|---|---|
| Top navigation remplacée par sidebar | ✅ |
| Toutes les destinations de nav présentes (New CRA, History, Paramètres) | ✅ |
| Sidebar visible en permanence sur desktop (220 px, flex row, `height: 100vh`) | ✅ |
| Main content scroll indépendant (`flex: 1; overflow-y: auto; min-width: 0`) | ✅ |
| Route active identifiable (`aria-current="page"` + accent CSS) | ✅ |
| Tiroir mobile (hamburger → drawer overlay 280 px, transition 0.25s) | ✅ |
| `inert` sur la sidebar fermée sur mobile — bloque focus/SR | ✅ |
| `role="dialog"` + `aria-modal="true"` quand tiroir ouvert | ✅ |
| Focus déplacé vers le premier bouton à l'ouverture | ✅ |
| Piège de focus Tab/Shift-Tab actif quand tiroir ouvert | ✅ |
| Escape ferme le tiroir | ✅ |
| Backdrop click ferme le tiroir | ✅ |
| `aria-label` sur tous les éléments interactifs | ✅ |
| `focus-visible` visible sur tous les boutons | ✅ |
| `aria-expanded` sur le bouton hamburger | ✅ |
| Détection de breakpoint JS synchronisée avec CSS (`max-width: 767px`) | ✅ |
| Scope borné — aucune modification de App.tsx, vues, tokens | ✅ |
| 278 tests existants verts | ✅ |

## Problèmes détectés

### 🔴 [BLOQUANT] Focus non retourné au déclencheur après fermeture du tiroir

**Fichiers** : `AppShell.tsx`, `AppSidebar.tsx`

Quand le tiroir se ferme (Escape, clic backdrop, sélection d'un item), `setSidebarOpen(false)` est appelé et l'attribut `inert` est appliqué à la sidebar. Le focus était sur un bouton à l'intérieur de la sidebar — il tombe désormais sur `document.body`. L'utilisateur clavier perd entièrement son contexte de navigation et doit re-parcourir la page depuis le début.

Le pattern ARIA APG Dialog et l'acceptance criterion du ticket ("Keyboard-only users can access every sidebar action") exigent que le focus retourne au déclencheur (bouton hamburger) à la fermeture.

**Correction minimale** — dans `AppShell.tsx` :

```tsx
// Ajouter une ref sur le bouton hamburger
const hamburgerRef = useRef<HTMLButtonElement>(null);

// Retourner le focus quand sidebarOpen passe à false
const prevSidebarOpen = useRef(false);
useEffect(() => {
  if (prevSidebarOpen.current && !sidebarOpen) {
    hamburgerRef.current?.focus();
  }
  prevSidebarOpen.current = sidebarOpen;
}, [sidebarOpen]);

// Appliquer la ref sur le bouton
<button ref={hamburgerRef} ...>☰</button>
```

---

### 🟡 [Observation] `handleNavClick` appelle `onClose()` sur desktop également

**Fichier** : `AppSidebar.tsx:62-65`

`onClose` est toujours appelé, même sur desktop où `sidebarOpen` ne peut jamais être `true`. Le state setter `setSidebarOpen(false)` s'exécute donc inutilement à chaque navigation desktop. C'est sans conséquence fonctionnelle (idempotent) mais légèrement trompeur. Corrigible lors d'un prochain passage si besoin.

---

### 🟡 [Observation] Pas de `aria-controls` sur le hamburger

**Fichier** : `AppShell.tsx:33-40`

`aria-expanded` est présent mais `aria-controls` pointant vers l'id de la sidebar manque. Recommandé par le pattern ARIA APG Button mais non bloquant (le comportement reste compréhensible via `aria-expanded` + l'annonce du `role="dialog"`).

---

### 🟡 [Observation] Pas de scroll-lock sur mobile quand tiroir ouvert

Le contenu de la page reste scrollable derrière le backdrop sur mobile (tactile). Ce n'est pas une régression et ce n'est pas exigé par le ticket, mais c'est une UX courante à prévoir dans un suivi.

## Risques éventuels

- Aucun risque sécurité — le composant est purement UI/navigation, sans données sensibles ni appel externe.
- Le focus drop (issue bloquante) est le seul risque réel d'accessibilité WCAG Level A restant.

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[Obligatoire]** Retourner le focus au bouton hamburger après fermeture du tiroir — cf. correction minimale ci-dessus dans `AppShell.tsx`. Une `ref` sur le bouton hamburger + un `useEffect` sur `sidebarOpen` suffisent.
2. [Optionnel] Ajouter `aria-controls` sur le hamburger pointant vers un `id` ajouté sur la `<aside>`.

IMPLEMENTATION_FIX_REQUIRED