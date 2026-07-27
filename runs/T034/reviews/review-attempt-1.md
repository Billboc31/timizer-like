# PR Review — T034: Introduce a professional frontend design system

## Résumé

L'implémentation crée `tokens.css` et `base.css` dans `frontend/src/styles/`, les importe via `index.css`, et migre les cinq fichiers CSS de composants existants vers les variables CSS. Le scope est strictement respecté : aucun changement de comportement, aucun framework UI, aucun écran métier reconstruit.

## Vérifications effectuées

- Lecture de `tokens.css`, `base.css`, `index.css`, `App.css`
- Lecture des CSS modifiés : `CalendarGrid.css`, `CraHistory.css`, `CraValidation.css`
- Lecture des composants TSX pour vérifier l'usage des classes
- Vérification des valeurs hexadécimales résiduelles dans les CSS
- Exécution du build Vite (`vite build`) → succès (9.65 kB CSS, 199 kB JS)
- Vérification des états de focus, des boutons disabled, et des variantes de badge

## Points validés

- **Tokens centralisés** : `tokens.css` couvre couleurs (brand, neutral, semantic), typographie (6 tailles, 4 graisses, 3 interlignes), espacement (`--space-1` à `--space-16`), border-radius, ombres, border, focus ring, et breakpoints.
- **Classes de base complètes** : `base.css` fournit `.page`, `.card` (header/body/footer), `.btn` (primary / secondary / destructive / disabled), `.input` (hover / focus / disabled / error), `.badge` (4 variantes), `.table` (hover row), `.dialog-overlay` / `.dialog`, `.empty-state`.
- **Focus accessible** : `:focus-visible` avec `var(--focus-ring)` défini sur `.btn` et `.input` — les deux éléments interactifs de la design system.
- **Migration des hardcoded** : aucune valeur hexadécimale résiduelle dans les CSS de composants — tout est tokenisé.
- **Build Vite réussi** : l'erreur TypeScript `process` dans `httpClient.ts` est pré-existante au ticket (non introduite par cette branche), hors scope.
- **Scope conforme** : aucun changement de logique React, aucune nouvelle dépendance, aucun framework CSS ajouté.

## Problèmes détectés

### Mineurs (non bloquants)

1. **Breakpoints CSS custom properties inutilisables dans les `@media`** — `--bp-sm: 640px` etc. sont déclarés dans `:root` mais les propriétés CSS custom ne peuvent pas être interpolées dans les conditions `@media` (`@media (min-width: var(--bp-sm))` ne fonctionne pas en CSS natif). Aucun `@media` n'est présent dans la codebase, donc l'impact est nul aujourd'hui, mais les consommateurs futurs pourraient s'y fier incorrectement.
   - **Action suggérée** : ajouter un commentaire dans `tokens.css` précisant que ces valeurs sont réservées à un usage JS/TS (ex. `window.matchMedia`) et ne s'utilisent pas directement dans `@media`.

2. **Deux valeurs `rgb()` hardcodées dans `base.css`** :
   - `.input--error:focus` : `box-shadow: 0 0 0 3px rgb(220 38 38 / 0.3)` — cohérent avec `--color-error: #dc2626` mais pas tokenisé comme `--focus-ring-error`.
   - `.dialog-overlay` : `background-color: rgb(0 0 0 / 0.5)` — raisonnable pour un overlay, mais non tokenisé.
   Impact cosmétique minimal ; acceptable pour une première version.

3. **`color-scheme: light dark` dans `index.css`** — active le mode sombre natif du navigateur/OS, ce qui peut faire passer certains éléments en dark sans token correspondant. Le dark mode est explicitement hors scope, mais cette déclaration crée un risque de rendu incohérent sur OS en dark mode. Recommandation : passer à `color-scheme: light` jusqu'à ce qu'un ticket dark mode soit implémenté.

4. **Classes de base non utilisées par les composants existants** — `CraHistory`, `CraValidation`, `CalendarGrid` conservent leur propre CSS scopé avec les variables. C'est conforme au scope du ticket ("add reusable base styles", pas "migrate"), mais implique que la design system n'est pas encore testée in-situ sur des composants réels.

5. **`font-family` non tokenisé** — défini directement dans `index.css` sous `:root`, non extrait comme `--font-family-base` dans `tokens.css`. Cohérence mineure.

## Risques éventuels

- Aucun risque de régression fonctionnel : les modifications sont purement CSS, le build Vite réussit, et les composants TSX sont inchangés.
- Le point 3 (`color-scheme: light dark`) est le seul risque visuel potentiel en environnement dark mode.

## Décision

APPROVED — L'implémentation satisfait tous les critères d'acceptance du ticket. Les observations ci-dessus sont des améliorations futures, non des blockers.

## Actions demandées

Aucune action bloquante. Suggestions pour un suivi :
- Corriger `color-scheme: light dark` → `light` (point 3) avant de considérer le dark mode.
- Documenter la limitation des breakpoints custom properties (point 1).
