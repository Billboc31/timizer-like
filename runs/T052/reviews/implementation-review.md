All key files are verified. Here is the complete review:

---

## T052 — CRA Signature Workflow: Implementation Review (Retry)

### Résumé

Deuxième review suite au `IMPLEMENTATION_FIX_REQUIRED` de la première passe. Le bug bloquant (`CraHistoryService.toSummary` retournant toujours `DRAFT` pour les nouveaux statuts) a été corrigé. La review porte sur l'ensemble de l'implémentation en l'état actuel.

---

### Vérifications effectuées

- Lecture du plan (`runs/T052/plan.md`) et comparaison avec l'implémentation
- Vérification du fix appliqué dans `CraHistoryService.java`
- Lecture de `CraDetailsMapper.mapStatus()` (utilisé par le fix)
- Lecture de `CraSignatureTransitionService.java` (logique de transition)
- Lecture de `ValidationStatus.java` (enum domaine)
- Lecture de `CraHistoryServiceTest.java` (tests mis à jour)
- Revue des artifacts d'implémentation et de la sortie du coder (135 tests passing)

---

### Points validés

| Critère d'acceptance | Statut |
|---|---|
| `ValidationStatus` contient les 5 nouveaux états | ✅ |
| `POST /submit` → 200 `READY_FOR_PROVIDER_SIGNATURE` | ✅ |
| `POST /sign-provider` → 200 `SIGNED_BY_PROVIDER` + date | ✅ |
| `POST /send-to-client` → 200 `AWAITING_CLIENT_SIGNATURE` | ✅ |
| Transition invalide → 409 `invalid_cra_transition` | ✅ |
| Transition dupliquée → 409 `duplicate_cra_transition` | ✅ |
| `PATCH /days/{date}` → 409 pour tout CRA non-DRAFT | ✅ |
| PDF rejeté (422) pour DRAFT / READY_FOR_PROVIDER_SIGNATURE | ✅ |
| PDF accepté (200) pour SIGNED_BY_PROVIDER+ | ✅ |
| Rows `VALIDATED` → `FULLY_SIGNED` sans migration DB | ✅ |
| `CraHistoryService` émet le bon statut pour tous les états | ✅ (fix appliqué) |
| `CraSignatureStatus` : label + couleur distincts par statut | ✅ |
| `CraSignatureActions` : bouton unique selon état, absent sinon | ✅ |
| Tests unitaires : toutes transitions autorisées et rejetées | ✅ |
| Test intégration : workflow complet DRAFT → AWAITING_CLIENT_SIGNATURE | ✅ |
| `CraValidationController` / `CraValidationService` supprimés | ✅ |

---

### Problèmes détectés

Aucun problème bloquant. Le seul défaut identifié en review 1 (`CraHistoryService.toSummary` utilisant un ternaire à deux valeurs) est corrigé à la ligne 37 :

```java
CraStatus status = CraDetailsMapper.mapStatus(report.getStatus());
```

La méthode `mapStatus` couvre les 6 valeurs de `ValidationStatus` avec la règle rétrocompat `VALIDATED → FULLY_SIGNED`, et est partagée entre `CraDetailsMapper.toDto()` et `CraHistoryService.toSummary()`.

---

### Risques éventuels

**Mineurs / non-bloquants :**

1. `CraStatus.VALIDATED` présent dans le type TypeScript frontend mais jamais émis par le backend (le mapper émet `FULLY_SIGNED`). Défensif et cohérent avec le plan — pas un bug.

2. `FULLY_SIGNED` est un état atteignable uniquement depuis les anciennes rows `VALIDATED` ; aucune transition du nouveau workflow n'y mène. Correct selon le scope (page de signature client hors scope).

3. `CraValidatedException` reste le nom d'exception utilisé par `CraDayUpdateService` pour bloquer les éditions sur tout CRA non-DRAFT. Le nom est un artefact legacy, mais le comportement runtime est correct (mappé → 409). À renommer dans un ticket de suivi si souhaité.

---

### Décision

L'implémentation couvre intégralement les critères d'acceptance du ticket. Le fix de la review précédente est en place et correctement testé. Aucun nouveau défaut détecté.

IMPLEMENTATION_APPROVED
