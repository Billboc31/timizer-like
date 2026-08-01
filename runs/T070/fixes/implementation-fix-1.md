# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T070/reviews/implementation-review.md
- generated at: 2026-08-01T23:21:02Z

---

---

# PR Review — T070: Fix annual calendar card overlap and responsive resizing

## Résumé

L'implémentation corrige le bug de chevauchement des cartes au hover et améliore la responsive du calendrier annuel. Les quatre fichiers ciblés par le plan ont été modifiés correctement. Un problème bloquant a été identifié : les snapshots de référence pour les trois nouveaux tests visuels ne sont pas committés.

## Vérifications effectuées

- Diff de chaque fichier modifié par rapport à la base (`ai-dev-factory/bootstrap-agent-layout`)
- Conformité avec le plan (`runs/T070/plan.md`)
- Conformité avec les critères d'acceptation du ticket
- État des snapshots visuels existants et manquants
- Configuration CI (`frontend-ci.yml`)

## Points validés

**MonthMiniCard.css** — Corrections chirurgicales et correctes :
- `position: relative` ajouté sur `.month-mini-card` — nécessaire pour que `z-index` soit effectif
- `transform: translateY(-2px)` retiré du `:hover` — cause racine du chevauchement
- `transform` retiré de la `transition` — nettoyage cohérent
- `z-index: 1` ajouté sur `:hover` et `:focus-visible` — le shadow reste visible sans déplacer la carte

**AnnualCalendar.css** — Deux additions minimales et correctes :
- `.annual-calendar-grid > * { min-width: 0; }` — corrige l'overflow CSS Grid (défaut `min-width: auto`)
- `@media (max-width: 399px)` — colonne unique sur narrow mobile (390px iPhone couvert par ce breakpoint)

**playwright.config.ts** — Ajout du projet `tablet` (768×1024) conforme au plan.

**visual.spec.ts** — Trois tests correctement scopés via `test.skip()` avec le pattern existant, mock API et sélecteur `.annual-calendar-grid` corrects.

## Problèmes détectés

### [BLOQUANT] Snapshots de référence manquants

Les trois nouveaux tests visuels n'ont aucune baseline committée :
- `e2e/__snapshots__/visual.spec.ts-snapshots/annual-calendar-desktop-darwin.png`
- `e2e/__snapshots__/visual.spec.ts-snapshots/annual-calendar-tablet-darwin.png`
- `e2e/__snapshots__/visual.spec.ts-snapshots/annual-calendar-mobile-darwin.png`

Sans ces fichiers, `npm run test:e2e` échoue au premier run en CI. Le critère d'acceptation du plan stipule explicitement **"new baselines committed"**. Ce critère n'est pas satisfait.

### [BLOQUANT] Snapshot collateral — projet `tablet` sur le test `CRA screen`

Le test `CRA screen` ne filtre aucun projet (pas de `test.skip()`). Il s'exécutait avant sur `chromium`, `desktop`, `mobile`. Avec l'ajout du projet `tablet`, il s'exécutera également sur `tablet`, ce qui nécessite une baseline `cra-screen-tablet-darwin.png` inexistante. Cela causera un échec CI supplémentaire.

## Risques éventuels

- La CI installe uniquement Chromium (`npx playwright install --with-deps chromium`). Les projets `tablet` et `desktop` héritent de Chromium par défaut — comportement correct. Les baselines générées en macOS (suffixe `-darwin`) ne matcheront pas celles attendues en CI Linux (suffixe `-linux`). Ce problème est pré-existant et hors scope T070, mais mérite d'être noté.

## Décision

- REQUEST_CHANGES

Les corrections CSS sont exactes et minimalistes. L'infrastructure de test est structurellement correcte. La seule raison de blocage est l'absence des baselines de snapshots — celles-ci doivent être générées (`npx playwright test --update-snapshots`) puis committées avant que la PR puisse être approuvée.

## Actions demandées

1. Générer les snapshots manquants (dans le worktree local) :
   ```
   cd frontend
   npx playwright test e2e/visual.spec.ts --update-snapshots
   ```
2. Vérifier que `cra-screen-tablet-darwin.png` est également généré.
3. Committer tous les nouveaux fichiers `.png` dans `e2e/__snapshots__/visual.spec.ts-snapshots/`.
4. Valider que `npm run test:e2e` passe sans erreur avant de repasser en review.

IMPLEMENTATION_FIX_REQUIRED
