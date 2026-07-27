Now I have everything needed to write a complete review.

---

# PR Review — T035 Application Shell and Navigation

## Résumé

L'implémentation introduit un composant `AppShell` qui encapsule l'intégralité de l'application dans une coquille branded avec header, navigation active-state, et zone de contenu contrainte. Le périmètre respecte strictement le ticket et le plan approuvé.

## Vérifications effectuées

- Lecture complète de `AppShell.tsx`, `AppShell.css`, `App.tsx`, `App.css`, `index.css`
- Vérification du diff du commit coder (`3d14cc45`) contre le plan approuvé
- Contrôle de tous les critères d'acceptation du ticket
- Vérification de l'absence de modifications sur les composants existants
- Contrôle de la structure CSS responsive (320px, 375px, 768px)
- Vérification des attributs d'accessibilité

## Points validés

**Fonctionnels**
- Tous les écrans existants (`CraMonthSelector`, `CraHistory`, `CraSummaryPanel`, `CalendarGrid`, `CraValidation`) s'affichent dans `AppShell` sans modification de leur logique — ✅
- Navigation "New CRA" / "History" clairement accessible — ✅
- `aria-current="page"` correctement appliqué sur l'item actif — ✅
- `<h2>` de titre de page rendu dans `<main>` selon la vue active — ✅
- 61 tests passent sans modification — ✅

**Accessibilité**
- Boutons de navigation focusables au clavier (Tab + Enter/Space) — ✅
- `:focus-visible` avec `outline: var(--focus-ring)` (2px solid amber) bien visible — ✅
- `<nav aria-label="Main navigation">` sémantiquement correct — ✅

**Responsive**
- `flex-wrap: wrap` sur le header évite le dépassement horizontal à 320px — ✅
- Media queries à 768px et 375px réduisent padding et taille de police — ✅
- `max-width` + `width: 100%` + `box-sizing: border-box` sur `<main>` — ✅
- Aucun élément avec largeur fixe susceptible de causer un overflow — ✅

**Qualité de code**
- Composant pur, props typées, interface explicite (`AppShellProps`) — ✅
- Nommage BEM cohérent en CSS — ✅
- CSS custom properties centralisées dans `index.css` — ✅
- Zero changement dans la couche API ou les composants existants — ✅
- Scope strictement borné au ticket — ✅

## Problèmes détectés

**Mineurs (non bloquants)**

1. **`type="button"` absent sur les boutons de navigation** — Les `<button>` dans `AppShell.tsx` n'ont pas `type="button"` explicite. Non problématique ici (pas dans un formulaire), mais bonne pratique HTML recommandée.

2. **`--space-6` défini mais jamais utilisé** — Variable CSS déclarée dans `index.css` mais non référencée dans le codebase. Dead code cosmétique.

3. **`App.css` vide mais toujours présent** — Le fichier est réduit à un fichier vide (blob `e69de29b`). Pas de régression fonctionnelle, mais légèrement inutile.

## Risques éventuels

- **Aucun risque de régression identifié** — L'encapsulation dans `AppShell` est additive ; aucun comportement existant n'est altéré.
- **Comportement pré-existant préservé** — `CraSummaryPanel`, `CalendarGrid`, et `CraValidation` s'affichent quelle que soit la vue active : comportement identique à avant.
- **`color-scheme: light dark`** conservé dans `index.css` — Le header `--color-brand: #2563eb` avec `--color-brand-text: #ffffff` peut ne pas respecter parfaitement le dark mode système, mais ce n'est pas dans le scope de ce ticket.

## Décision

- **APPROVED**

L'implémentation respecte le ticket, le plan, et les conventions du projet. Tous les critères d'acceptation sont satisfaits. Les observations mineures ne constituent pas des blocages et peuvent être adressées dans un ticket de polish ultérieur.

## Actions demandées

Aucune. L'implémentation peut passer en mémoire.

---

IMPLEMENTATION_APPROVED
