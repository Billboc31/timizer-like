La review est complète. Voici les conclusions :

---

## Review T079 — Résultat : `IMPLEMENTATION_FIX_REQUIRED`

### Positif

L'implémentation principale est solide : le backend bloque correctement la suppression des statuts finaux (`AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED`), la cascade de suppression (signature records → tokens → transition events → CRA + day entries) est correcte, le frontend affiche les boutons conditionnellement avec confirmation explicite, et les tests unitaires frontend couvrent les cas essentiels.

---

### 2 problèmes bloquants

**1. `FULLY_SIGNED` masqué derrière `AWAITING_CLIENT_SIGNATURE`** (`CraDetailsMapper.java` ligne 54)

```java
case FULLY_SIGNED -> CraStatus.AWAITING_CLIENT_SIGNATURE;  // FAUX
```

Le DTO `CraStatus` n'inclut pas `FULLY_SIGNED`, donc le mapper renvoie le mauvais statut au frontend. Un CRA entièrement signé par le client apparaît comme "En attente client" — sémantiquement trompeur. La correction requiert : ajouter `FULLY_SIGNED` dans le DTO enum, corriger le mapper, ajouter `'FULLY_SIGNED'` dans `types.ts`, et mettre à jour les switch de labels/badges dans `CraHistory.tsx`, `CraOverview.tsx`, et `CraSignatureStatus.tsx`.

**2. `cra_not_deletable` absent de la liste `known` dans `httpClient.ts`**

La fonction `toApiErrorCode()` ne reconnaît pas `'cra_not_deletable'` → il tombe dans `unknown_error`. Le message FR spécifique défini dans `errorMessages.ts` ne sera jamais affiché. Correction : ajouter `'cra_not_deletable'` dans le tableau `known`.

---

### Risques non-bloquants

- Pas de tests d'intégration backend pour `DELETE /api/cras/{id}` (opération irréversible sans filet)
- `isCraDeletable()` dupliqué dans deux composants (risque de dérive si les statuts évoluent)
