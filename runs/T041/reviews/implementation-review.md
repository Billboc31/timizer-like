I now have all the information needed to write the review. Let me produce it.

---

# PR Review — T041 : Add end-to-end tests for the complete monthly CRA workflow

## Résumé

L'implémentation introduit Playwright comme framework E2E, avec un fichier de config, un spec file de deux tests (happy path + scénario d'échec API), une mise à jour de `package.json` et une section de documentation dans `docs/local-development.md`. Le scope est strictement conforme au ticket et au plan.

## Vérifications effectuées

- Lecture du plan (`runs/T041/plan.md`) et de l'output (`runs/T041/implementation-output.md`)
- Lecture complète de `playwright.config.ts` et `e2e/cra-workflow.spec.ts`
- Vérification de l'ensemble des sélecteurs Playwright contre les composants React (`CraMonthSelector.tsx`, `CalendarGrid.tsx`, `CraSummaryPanel.tsx`, `CraValidation.tsx`, `CraHistory.tsx`, `App.tsx`)
- Vérification des patterns de routes mockées contre les endpoints du backend Spring Boot et du client API frontend (`craClient.ts`)
- Vérification du `package.json` (`@playwright/test` présent, scripts `test:e2e` et `test:e2e:ui` définis)
- Lecture de `docs/local-development.md` (section 10 ajoutée)

## Points validés

**Critères d'acceptation du ticket :**

| Critère | Statut |
|---------|--------|
| Happy path complet (sélection mois → PDF) | ✅ |
| Valeurs 0, 0.5 et 1 exercées et assertées | ✅ |
| Total mensuel affiché asserté (`summary-total`) | ✅ |
| Statut `VALIDATED` après validation asserté (`summary-status`) | ✅ |
| CRA validé visible en historique avec mois et statut | ✅ |
| PDF déclenché sans interaction manuelle (`waitForEvent('download')`) | ✅ |
| Scénario d'échec API couvert (500 sur `PATCH days/`) | ✅ |
| Commande locale documentée (`npm run test:e2e`) | ✅ |

**Alignement sélecteurs ↔ composants React :**

Tous les sélecteurs Playwright correspondent aux attributs réels dans le code :
- `getByLabel('Month')` / `getByLabel('Year')` → labels HTML corrects dans `CraMonthSelector`
- `getByRole('button', { name: 'Create CRA' })` / `'Open CRA'` → texte exact dans `CraMonthSelector`
- `data-testid="day-cell"` → présent dans `CalendarGrid.tsx:50`
- `.day-cell--weekend` / `.day-cell__worked` → classes CSS définies et appliquées
- `data-testid="summary-total"` / `"summary-status"` → présents dans `CraSummaryPanel`
- `getByRole('button', { name: 'Valider le CRA' })` / `'Confirmer'` → texte exact dans `CraValidation`
- `.cra-history__row` / `'Download PDF'` / `'History'` → présents dans `CraHistory` et `App`
- `getByRole('alert')` → `role="alert"` utilisé dans `App.tsx:62` pour les erreurs de mise à jour de jour

**Alignement mocks ↔ endpoints backend :**

| Opération | Pattern mock | Endpoint réel | Match |
|-----------|-------------|---------------|-------|
| List CRAs | `'/api/cras'` | `GET /api/cras` | ✅ |
| Create CRA | `'/api/cra'` | `POST /api/cra` | ✅ |
| Update day | `'**/api/cras/*/days/**'` | `PATCH /api/cras/{id}/days/{date}` | ✅ |
| Validate | `'**/api/cras/*/validate'` | `POST /api/cras/{id}/validate` | ✅ |
| PDF | `'**/api/cras/*/pdf'` | `GET /api/cras/{id}/pdf` | ✅ |

**Documentation :** Section 10 de `docs/local-development.md` est claire, complète et précise (mentionner `npx playwright install chromium`, signaler que le backend n'est pas requis car tout est mocké, décrire les deux modes d'exécution).

**Config Playwright :** `playwright.config.ts` est minimal et correct — Chromium seul, `baseURL`, `webServer` avec `reuseExistingServer: !CI`, screenshot on failure. Conforme au plan.

## Problèmes détectés

**Aucun bloquant.**

**Observations mineures (non bloquantes) :**

1. **`month = 7` hardcodé (juillet 2026)** — Le test fixe le mois/année à juillet 2026, ce qui correspond à la date courante lors de l'écriture. Puisque les sélecteurs de mois et d'année sont remplis explicitement par le test, ce hardcoding est sans effet fonctionnel ; le test passerait n'importe quel mois. Pas de problème.

2. **Objet `cra` mutable partagé entre handlers** — Le test utilise un objet `cra` muté depuis plusieurs `page.route()` closures. C'est fonctionnel pour un flux séquentiel, mais subtil à lire. Non bloquant.

3. **Tableau `MONTH_NAMES` dupliqué** — Défini dans `CraHistory.tsx`, `CraMonthSelector.tsx`, et maintenant dans le spec. C'est de la duplication mineure mais sans conséquence sur les tests.

4. **Pas de mock `GET /api/cras/{id}`** — La fonction `getCra()` existe dans `craClient.ts` mais n'est appelée nulle part dans les composants (marquée "pending implementation"). L'absence de ce mock est donc correcte aujourd'hui. À surveiller si une future implémentation introduit cet appel.

## Risques éventuels

- **Régression future sur les sélecteurs** — Les tests reposent sur des `data-testid`, classes CSS et textes de boutons stables. Si ces attributs changent sans mise à jour des tests, les tests cassent. C'est la nature normale des E2E — aucun risque spécifique à cette implémentation.
- **Playwright version** — `^1.49.0` est une ancienne version (la 1.49 date de fin 2024). Pas bloquant, mais lors d'une future mise à jour, vérifier la compatibilité.

## Décision

L'implémentation est correcte, complète, strictement dans le scope du ticket, et tous les critères d'acceptation sont satisfaits. Les sélecteurs, les mocks et la documentation sont alignés avec le code réel de l'application.

IMPLEMENTATION_APPROVED
