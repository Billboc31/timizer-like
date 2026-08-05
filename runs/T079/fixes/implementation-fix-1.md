# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T079/reviews/implementation-review.md
- generated at: 2026-08-05T22:05:13Z

---

I have all the information needed. Let me write the review.

---

## Review T079 — Allow permanent deletion of unsigned and unvalidated CRAs

**Résultat : `IMPLEMENTATION_FIX_REQUIRED`**

---

### Vue d'ensemble

L'implémentation principale est solide. Le backend bloque correctement la suppression des statuts finaux, la cascade de suppression respecte l'ordre de clés étrangères, le frontend expose les boutons conditionnellement avec confirmation explicite, et les tests couvrent les cas essentiels. Cependant, les deux problèmes bloquants identifiés lors de la première review restent non corrigés.

---

### Problèmes bloquants

#### 1. Mauvais mapping `FULLY_SIGNED` dans `CraDetailsMapper.java` (ligne 54)

```java
case FULLY_SIGNED -> CraStatus.AWAITING_CLIENT_SIGNATURE;  // FAUX
```

**Constat :** Le DTO `CraStatus` (5 valeurs : `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `VALIDATED`) ne contient pas `FULLY_SIGNED`. Le mapper masque silencieusement le statut terminal client-signé derrière un statut intermédiaire.

**Impact :** Tout CRA `FULLY_SIGNED` s'affiche à l'utilisateur comme "En attente client" — sémantiquement trompeur. Le ticket dépend explicitement de ce statut terminal (`FULLY_SIGNED`), qui doit être correctement représenté dans l'UI. Le bouton de suppression ne s'affichera pas (comportement correct par coincidence), mais le statut affiché est faux.

**Correction :** Deux options :
- *Option A (complète)* : ajouter `FULLY_SIGNED` au DTO enum Java, corriger le mapper, ajouter `'FULLY_SIGNED'` dans `types.ts`, mettre à jour les `switch` de labels/badges dans `CraHistory.tsx`, `CraOverview.tsx`, `CraSignatureStatus.tsx`.
- *Option B (pragmatique)* : mapper `FULLY_SIGNED → CraStatus.VALIDATED` dans le mapper Java — les deux sont des états terminaux non supprimables.

---

#### 2. `'cra_not_deletable'` absent du tableau `known` dans `httpClient.ts` (lignes 6–22)

```typescript
const known: ApiErrorCode[] = [
  // ...toute la liste...
  'validation_blocked',
  // 'cra_not_deletable' manquant ici
];
```

**Constat :** `apiError.ts` déclare bien `'cra_not_deletable'` dans le type `ApiErrorCode`, et `errorMessages.ts` line 20 définit le message FR `'Ce CRA ne peut pas être supprimé dans son état actuel.'` — mais `toApiErrorCode()` ne le reconnaît pas et retourne `'unknown_error'` à la place.

**Impact :** Quand le backend retourne un 409 avec `{"error": "cra_not_deletable"}`, l'utilisateur voit "Une erreur est survenue. Veuillez réessayer." au lieu du message explicite. Le canal d'erreur de la fonctionnalité principale est silencieusement cassé.

**Correction :** Ajouter `'cra_not_deletable',` dans le tableau `known` de `httpClient.ts`.

---

### Ce qui fonctionne correctement

**Backend :**
- `CraDeleteService.java` : garde correcte (`AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED` non supprimables) ; cascade dans l'ordre FK-safe ; `@Transactional` présent.
- `CraDeleteController.java` : `DELETE /api/cras/{id}` → 204 ; délégation propre au service.
- `CraApiExceptionHandler.java` : `CraNotDeletableException` → HTTP 409 avec code `"cra_not_deletable"`. Correct.
- Repositories modifiés (`deleteAllByCraId`) : `CraClientSignatureRecordRepository`, `CraDownloadTokenRepository`, `CraTransitionEventRepository`. Correct.

**Frontend :**
- `craClient.ts` : `deleteCra(craId)` → `DELETE /api/cras/${craId}`, attend 204.
- `CraHistory.tsx` : `isCraDeletable()` juste (`DRAFT | READY_FOR_PROVIDER_SIGNATURE | SIGNED_BY_PROVIDER`), confirmation `window.confirm` explicite, suppression locale immédiate du CRA de la liste, erreur inline.
- `CraDetailModal.tsx` : même logique, fermeture du modal + appel `onDeleted()` après succès.
- `App.tsx` : `onDeleted` câblé pour rafraîchir historique et calendrier.
- Tests : 6 nouveaux tests dans `CraHistory.test.tsx` couvrant les cas de suppression.

---

### Observations non bloquantes

- `isCraDeletable()` est dupliqué dans `CraHistory.tsx` et `CraDetailModal.tsx` — faible risque actuellement (logiques identiques), mais nécessitera deux mises à jour si les statuts évoluent.
- Aucun test d'intégration backend pour `DELETE /api/cras/{id}` — opération irréversible sans filet de sécurité côté serveur.

---

IMPLEMENTATION_FIX_REQUIRED
