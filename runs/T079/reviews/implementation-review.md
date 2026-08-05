I now have a complete picture of the implementation. Let me write the review.

---

## Review T079 — Allow permanent deletion of unsigned and unvalidated CRAs

**Résultat : `IMPLEMENTATION_APPROVED`**

---

### Vue d'ensemble

Les deux problèmes bloquants identifiés lors de la review précédente ont été correctement corrigés et vérifiés dans le code source. L'implémentation complète est solide, conforme au ticket, et respecte les contraintes de sécurité et de qualité.

---

### Vérification des corrections demandées

#### 1. `CraDetailsMapper.java` ligne 54 — CORRIGÉ ✅

```java
case FULLY_SIGNED -> CraStatus.VALIDATED;  // était incorrectement AWAITING_CLIENT_SIGNATURE
```

Le mapping est désormais sémantiquement correct. `FULLY_SIGNED` et `VALIDATED` sont deux états terminaux non supprimables, et `VALIDATED` est le plus fidèle pour l'affichage.

#### 2. `httpClient.ts` ligne 22 — CORRIGÉ ✅

```typescript
'cra_not_deletable',  // ajouté dans le tableau known
```

Le 409 retourné par le backend déclenche maintenant le message français "Ce CRA ne peut pas être supprimé dans son état actuel." au lieu du fallback générique.

---

### Validation des critères d'acceptance

| Critère | Statut |
|---|---|
| Delete depuis History pour CRA non signé/validé | ✅ — bouton visible pour `DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER` |
| Delete depuis CRA detail view | ✅ — même logique dans `CraDetailModal.tsx` |
| Dialog de confirmation explicite | ✅ — `window.confirm` avec mention "irréversible" dans les deux composants |
| Disparition du CRA après confirmation | ✅ — filtre local dans History + `onClose(); onDeleted?.()` dans Modal avec refresh keys |
| CRAs signés/validés non supprimables via UI | ✅ — `isCraDeletable()` correct dans les deux composants |
| CRAs signés/validés non supprimables via API | ✅ — garde backend sur `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED` → 409 |
| Données associées supprimées proprement | ✅ — cascade FK-safe : `CraClientSignatureRecord` → `CraSignatureToken` → `CraDownloadToken` → `CraTransitionEvent` → `MonthlyCraReport` (cascade vers `CraDayEntry` via JPA `orphanRemoval`) |
| Données partagées préservées | ✅ — seules les tables CRA-spécifiques sont touchées |
| Refresh History et calendrier | ✅ — `handleModalDeleted` incrémente `historyRefreshKey` et `annualCalendarRefreshKey` |
| Erreur 409 correctement surfacée | ✅ — `cra_not_deletable` dans `known` array + message FR dans `errorMessages.ts` |

---

### Ce qui fonctionne correctement

**Backend :**
- `CraDeleteService` : `@Transactional`, garde correcte, suppression dans l'ordre FK-safe — correct.
- `CraDeleteController` : `DELETE /api/cras/{id}` → 204, délégation propre — correct.
- `CraApiExceptionHandler` : `CraNotDeletableException` → 409 `"cra_not_deletable"` — correct.
- Repositories : `deleteAllByCraId` ajouté dans `CraClientSignatureRecordRepository`, `CraDownloadTokenRepository`, `CraTransitionEventRepository` — correct.
- `MonthlyCraReport` : `CascadeType.ALL` + `orphanRemoval = true` sur `dayEntries` — la suppression JPA cascade correctement.

**Frontend :**
- `craClient.ts` : `deleteCra(id)` → `apiDelete(/api/cras/${id})` — correct.
- Erreurs : `cra_not_deletable` dans `ApiErrorCode`, `known`, `errorMessages` — chaîne complète fonctionnelle.
- Tests `CraHistory.test.tsx` : 6 tests couvrant bouton visible/absent, suppression confirmée, annulation, erreur — correct.

---

### Observations non bloquantes (inchangées)

- `isCraDeletable()` est dupliqué dans `CraHistory.tsx` et `CraDetailModal.tsx` — faible risque à l'état actuel (logiques identiques).
- Aucun test backend pour `CraDeleteService` ou `CraDeleteController` — opération irréversible sans filet côté serveur.
- Aucun test de suppression dans `CraDetailModal.test.tsx` — le chemin de suppression depuis la modal est non couvert.

---

IMPLEMENTATION_APPROVED
