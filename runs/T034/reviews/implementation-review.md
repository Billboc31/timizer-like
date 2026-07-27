---

# PR Review — T034: Introduce a professional frontend design system

## Résumé

L'implémentation crée `tokens.css` et `base.css` dans `frontend/src/styles/`, les importe via `index.css`, et migre les cinq fichiers CSS de composants existants vers les variables CSS. Le scope est strictement respecté.

## Vérifications effectuées

- `tokens.css`, `base.css`, `index.css`, `App.css`, trois CSS de composants lus
- Build Vite exécuté → **succès** (9.65 kB CSS, 199 kB JS, 58 ms)
- Recherche de valeurs hex résiduelles dans les CSS
- Vérification des états focus, disabled, variantes de badge/button

## Points validés

- **Tokens centralisés** dans un seul fichier : couleurs (brand, neutral, semantic), typographie, espacement (`--space-1` à `--space-16`), border-radius, ombres, border, focus ring, breakpoints
- **Classes de base complètes** : `.btn` (primary/secondary/destructive/disabled), `.input` (hover/focus/disabled/error), `.badge` (4 variantes), `.card`, `.table`, `.dialog`, `.empty-state`
- **Focus accessible** : `:focus-visible` avec `var(--focus-ring)` sur `.btn` et `.input`
- **Zéro hex hardcodé** dans les CSS de composants — tout tokenisé
- **Build propre** ; l'erreur TS `process` dans `httpClient.ts` est pré-existante, non introduite par cette branche

## Problèmes détectés (non bloquants)

1. **Breakpoints CSS custom properties non interpolables dans `@media`** — `var(--bp-sm)` dans une condition `@media` ne fonctionne pas en CSS natif. Aucun impact aujourd'hui (pas de `@media` dans le code), mais un commentaire serait utile pour prévenir les futurs consommateurs.

2. **Deux `rgb()` hardcodés dans `base.css`** — focus ring erreur et overlay dialog. Cohérents mais non tokenisés.

3. **`color-scheme: light dark` dans `index.css`** — risque de rendu incohérent sur OS en dark mode puisque les tokens dark n'existent pas encore. Suggéré : passer à `light` jusqu'au ticket dark mode.

4. **Classes de base non adoptées par les composants existants** — conforme au scope ("ajouter", pas "migrer"), mais implique que le système n'est pas encore exercé in-situ.

## Décision

APPROVED — Tous les critères d'acceptance sont satisfaits. Aucune action bloquante requise.

IMPLEMENTATION_APPROVED
