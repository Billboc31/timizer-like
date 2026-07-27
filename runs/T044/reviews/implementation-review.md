---

# PR Review — T044: Add visual regression coverage for the main Timizer-like screens

## Résumé

L'implémentation ajoute une suite Playwright de tests de régression visuelle couvrant les écrans principaux de l'application. Les six baselines sont committés. Le code est propre, ciblé, et n'outrepasse pas le scope du ticket.

## Vérifications effectuées

- Lecture de `frontend/e2e/visual.spec.ts` (73 lignes)
- Lecture de `frontend/e2e/fixtures/cra-fixtures.ts` (56 lignes)
- Lecture de `frontend/playwright.config.ts` (32 lignes)
- Lecture de `frontend/package.json` (scripts + dépendances)
- Lecture de `frontend/README.md` (section visual regression tests)
- Vérification des fichiers baselines dans `frontend/e2e/__snapshots__/visual.spec.ts-snapshots/`
- Lecture du plan `runs/T044/plan.md`
- Croisement systématique avec les 7 critères d'acceptance du ticket

## Points validés

**Acceptance criteria — tous satisfaits :**

| Critère | Statut | Preuve |
|---|---|---|
| Desktop baseline CRA screen | ✅ | `cra-screen-desktop-darwin.png` (54,8 KB) |
| Mobile baseline CRA screen | ✅ | `cra-screen-mobile-darwin.png` (60,6 KB) |
| History page baseline | ✅ | `history-desktop-darwin.png` (33,8 KB) |
| Au moins un état loading/error | ✅ | `loading-state-desktop-darwin.png` + `error-state-desktop-darwin.png` |
| Données et mois déterministes | ✅ | Aucun `new Date()` / `Date.now()` — tout vient de `cra-fixtures.ts` avec dates absolues (mars 2024) |
| Commande unique documentée | ✅ | `npm run test:visual` dans README + package.json |
| Un changement layout fait échouer les tests | ✅ | Seuil `maxDiffPixelRatio: 0.001` (0,1 %) sur Chromium déterministe |

**Qualité technique :**

- Helper `navigateToCraScreen` factorisant navigation + sélection de mois/année + désactivation des animations — code DRY sans sur-ingénierie.
- Animations désactivées via `page.addStyleTag` après `waitForSelector`, avant la capture — ordre correct.
- `page.route()` appelé **avant** `page.goto()` dans tous les tests — interception garantie sans race condition.
- Stratégie d'attente explicite et sémantique : `waitForLoadState('networkidle')`, `waitForSelector('.calendar-grid')`, `waitForSelector('[role="alert"]')` — pas de `waitForTimeout` arbitraire.
- Loading state correctement figé : route qui ne fulfille jamais avant la capture ; le test attend `p:has-text("Loading...")` confirmant que le spinner est visible.
- Test `CRA screen` s'exécute sur les deux projets (desktop + mobile) sans `test.skip`, les autres utilisent `test.skip(testInfo.project.name !== 'desktop')` — pattern clair et intentionnel.
- `fullyParallel: false` : rendu séquentiel pour cohérence des baselines.

**Conformité au plan :**

- Scope respecté. Pas de CI/CD ajouté, pas de composants isolés, pas de dépendances non justifiées.
- Le plan mentionnait le statut `IN_PROGRESS` ; l'implémentation utilise correctement `DRAFT` (conforme à l'interface `CraSummaryApi` réelle) — la fixture corrige une erreur de nomenclature du plan, ce n'est pas une régression.

## Problèmes détectés

Aucun problème bloquant.

## Risques éventuels

**Baselines spécifiques à la plateforme (darwin)** — Playwright génère automatiquement les noms avec le suffixe OS (`-darwin`). Sur un CI Linux, les tests échoueraient immédiatement sans re-génération des baselines sur cet OS. C'est un comportement attendu de Playwright et explicitement hors scope du ticket (*"Pixel-perfect comparison across unsupported operating systems"*). À documenter si un CI Linux est ajouté ultérieurement.

**Sélecteurs textuels** (`button:has-text("Open CRA")`, `button:has-text("History")`, `p:has-text("Loading...")`) — couplés aux libellés UI. Un changement de wording casse les tests. Acceptable pour une suite de cette taille, mais à surveiller.

## Décision

- ✅ APPROVED

Tous les critères d'acceptance sont satisfaits. Le code est propre, déterministe, et correctement borné au scope du ticket. Aucune correction requise.

## Actions demandées

Aucune.

---

IMPLEMENTATION_APPROVED
