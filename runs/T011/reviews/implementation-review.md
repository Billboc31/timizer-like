I have all the information needed to write the review.

---

# PR Review — T011 : Create CRA retrieval API

## Résumé

L'implémentation livre correctement les deux endpoints GET requis par T011 (`GET /api/cra/{id}` et `GET /api/cra/{year}/{month}`), avec la réponse `CraDetailsDto` complète, la gestion du 404, et une suite de tests couvrant les quatre scénarios attendus. Cependant, le PR introduit en parallèle plusieurs endpoints et services explicitement exclus du périmètre du ticket, ce qui constitue une dérive de scope significative.

## Vérifications effectuées

- Lecture du ticket T011 et du plan `runs/T011/plan.md`
- Inspection de `CraController`, `CraDetailsMapper`, `CraDetailsDto`, `CraApiExceptionHandler`, `MonthlyCraReportRepository`
- Lecture des 4 nouveaux contrôleurs : `CraController`, `CraDayController`, `CraValidationController`, `CraHistoryController`
- Inspection de `CraControllerTest` (tests GET + POST)
- Vérification de la configuration Spring Boot (`scanBasePackages`, `@EntityScan`, `@EnableJpaRepositories`)
- Comptage des fichiers ajoutés (~72 fichiers)

## Points validés

- `GET /api/cra/{id}` : retourne HTTP 200 avec `CraDetailsDto` complet (id, month, year, status, totalWorkedDays, days) ✓
- `GET /api/cra/{year}/{month}` : retourne HTTP 200 avec le même body ✓
- Les deux endpoints retournent HTTP 404 + `{"error": "cra_not_found"}` si l'enregistrement est absent ✓
- `CraDetailsMapper.toDto` calcule correctement `totalWorkedDays` (somme des workValue) ✓
- Mapping `ValidationStatus → CraStatus` (DRAFT/VALIDATED) correct ✓
- `CraApiExceptionHandler` couvre `CraNotFoundException` → 404 ✓
- `MonthlyCraReportRepository` expose `findById` et `findByMonthAndYear` ✓
- 4 tests couvrant les cas happy path + not found pour chaque endpoint ✓
- `@SpringBootApplication(scanBasePackages = {"com.timizer", "com.timizerlike"})` — la scission de packages est intentionnelle et fonctionnelle ✓

## Problèmes détectés

### 🔴 BLOQUANT — Dérive de scope majeure

Le plan `runs/T011/plan.md` exclut explicitement :

> "CRA creation endpoint, Day entry update endpoint, CRA list / history endpoint, Any refactor of existing controllers or services"

Le PR ajoute néanmoins :

| Fichier | Endpoint | Statut |
|---|---|---|
| `CraController.java` | `POST /api/cra` (création) | **Hors scope** |
| `CraDayController.java` | `PATCH /api/cras/{craId}/days/{date}` | **Hors scope** |
| `CraValidationController.java` | `POST /api/cras/{craId}/validate` | **Hors scope** |
| `CraHistoryController.java` | `GET /api/cras` | **Hors scope** |

Et les services associés : `MonthlyCraCreationService`, `CraDayUpdateService`, `CraValidationService`, `CraHistoryService`, `CraDayEntryRepository`.

Ces éléments n'ont pas été revus dans le contexte des tickets qui devraient les porter, ne bénéficient pas d'une couverture de tests dédiée dans ce PR, et introduisent une surface fonctionnelle non validée dans la base de code.

### 🟡 MINEUR — `CraNotFoundException(null)` dans `getCraByYearAndMonth`

```java
// CraController.java:52
.orElseThrow(() -> new CraNotFoundException(null));
```

Quand l'ID est absent (recherche par mois/année), l'exception est créée avec `null`. Par cohérence et debuggabilité, il serait préférable d'utiliser un constructeur dédié ou de passer les paramètres `year`/`month`.

### 🟡 MINEUR — Architecture packages duale

Les nouvelles classes sont réparties entre `com.timizer.backend.*` (controller, repository, mapper, domain) et `com.timizerlike.backend.*` (DTOs, contrôleurs OOS, exception handler), alors que le code historique est dans `com.timizerlike.cra.*`. Le `scanBasePackages` compense, mais cette structure en trois racines manque de cohérence.

## Risques éventuels

- Les endpoints hors scope (`POST /api/cra`, `PATCH`, `POST /validate`, `GET /api/cras`) sont accessibles dès le merge, sans revue formelle dans leur ticket d'origine
- `CraDayController` et `CraValidationController` n'ont aucun test dans ce PR
- Si ces tickets (création, mise à jour jour, validation, historique) sont traités ultérieurement, il y aura un risque de conflit ou de double implémentation

## Décision

REQUEST_CHANGES

## Actions demandées

1. **Supprimer les fichiers hors scope** de cette branche :
   - `CraDayController.java` et `CraDayUpdateService.java`
   - `CraValidationController.java` et `CraValidationService.java`
   - `CraHistoryController.java` et `CraHistoryService.java`
   - `MonthlyCraCreationService.java` (et le `@PostMapping` dans `CraController`)
   - `CraDayEntryRepository.java`
   - DTOs associés non utilisés par les endpoints GET : `CraDayUpdateRequestDto`, `CraCreateOrUpdateRequestDto`, `ValidateCraRequestDto`, `CraSummaryDto`
2. **`CraController`** : retirer le `@PostMapping createCra` et l'injection de `MonthlyCraCreationService` — le contrôleur ne doit exposer que les deux GET endpoints
3. (mineur) Améliorer `CraNotFoundException` pour le cas month/year — passer les paramètres ou un message descriptif plutôt que `null`

IMPLEMENTATION_FIX_REQUIRED
