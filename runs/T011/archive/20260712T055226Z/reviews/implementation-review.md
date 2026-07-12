---

# PR Review — T011 Create CRA Retrieval API

## Résumé

Implémentation de deux endpoints GET : `GET /api/cra/{id}` et `GET /api/cra/{year}/{month}`. Le code est propre, borné au scope du ticket, et réutilise les composants existants (mapper, DTO, repository).

## Points validés

- **Tous les critères d'acceptation sont satisfaits** :
  - GET par id → HTTP 200 avec payload complet (id, month, year, status, totalWorkedDays, days)
  - GET par mois/année → HTTP 200 idem
  - CRA manquant → HTTP 404 avec `{"error": "cra_not_found"}` structuré
  - 65 tests passent, dont les 6 tests POST inchangés

- **Architecture conforme** : exception centralisée via `@RestControllerAdvice`, injection constructeur, pattern `Optional.map().orElseThrow()`, réutilisation du `CraDetailsMapper` et `CraDetailsDto` existants

- **Scope respecté** : aucune dérive (pas de création/update/suppression, pas d'auth, pas de PDF)

## Observations mineures (non bloquantes)

1. **Dualité de packages** : `CraNotFoundException` dans `com.timizer.backend.cra`, `CraApiExceptionHandler` dans `com.timizerlike.backend.cra.web` — pattern pré-existant du projet, acceptable.
2. **Message d'exception générique** : pas de contexte (quel id ? quel mois ?) — utile en debug mais hors scope.
3. **Wrapping réponse** : POST utilise `ResponseEntity<>`, GET retourne le DTO directement — incohérence de style mineure.
4. **Validation des path variables** : year/month non validés pour les plages logiques — hors scope.

## Décision

Aucun problème bloquant. L'implémentation est correcte et production-ready.

Review sauvegardée dans `runs/T011/reviews/review-1.md`.

IMPLEMENTATION_APPROVED
