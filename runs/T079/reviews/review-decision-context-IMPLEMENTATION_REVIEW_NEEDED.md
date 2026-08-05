# PR Review — T079: Allow permanent deletion of unsigned and unvalidated CRAs

## Résumé

L'implémentation couvre la suppression permanente de CRA côté backend (service, contrôleur, exception, handler) et côté frontend (bouton, confirmation, rafraîchissement). La mécanique principale est correcte. Deux problèmes bloquants empêchent l'approbation.

## Vérifications effectuées

- Ticket T079 et plan
- `CraDeleteService.java` — logique de garde et cascade
- `CraDeleteController.java` — endpoint et codes HTTP
- `CraNotDeletableException.java` + `CraApiExceptionHandler.java` — mapping exception → 409
- `CraDetailsMapper.java` — mapping `ValidationStatus` → DTO `CraStatus`
- DTO `CraStatus.java` — enum exposé au frontend
- `frontend/src/api/types.ts` — `CraStatus` côté frontend
- `frontend/src/api/httpClient.ts` — liste des codes d'erreur reconnus
- `frontend/src/api/apiError.ts` et `errorMessages.ts` — code `cra_not_deletable`
- `CraHistory.tsx`, `CraDetailModal.tsx` — bouton, confirmation, erreur
- `CraHistory.test.tsx` — tests frontend delete
- `CraSignatureWorkflowIntegrationTest.java` — tests d'intégration backend

## Points validés

- Backend : `CraDeleteService` bloque correctement `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED` via un `Set` immuable.
- La cascade de suppression est correcte : signature records → signature token → download tokens → transition events → CRA (orphan-removes day entries via JPA).
- Le handler renvoie 409 avec `"error": "cra_not_deletable"` pour les CRA non-supprimables.
- `CraDeleteController` renvoie 204 No Content sur succès.
- Frontend : `isCraDeletable()` retourne `false` pour tous les statuts finaux.
- La boîte de confirmation (`window.confirm`) est présente dans History et dans le modal avec un message explicite d'irréversibilité.
- Le rafraîchissement de la liste après suppression fonctionne (`setCras(prev => prev.filter(...))` en History, `onDeleted?.()` en modal).
- Les tests frontend couvrent les 6 cas essentiels (affichage conditionnel, suppression confirmée, annulation, erreur).
- `cra_not_deletable` est dans `apiError.ts` (type) et `errorMessages.ts` (message FR).

## Problèmes détectés

### BLOQUANT 1 — `FULLY_SIGNED` masqué derrière `AWAITING_CLIENT_SIGNATURE` dans `CraDetailsMapper`

**Fichier :** `backend/src/main/java/com/timizer/backend/cra/CraDetailsMapper.java` ligne 54

```java
case FULLY_SIGNED -> CraStatus.AWAITING_CLIENT_SIGNATURE;
```

Le DTO `CraStatus` (`com.timizerlike.backend.cra.dto.CraStatus`) ne contient pas `FULLY_SIGNED`, donc le mapper l'assimile à `AWAITING_CLIENT_SIGNATURE`. C'est sémantiquement faux : un CRA `FULLY_SIGNED` a déjà été signé par le client, tandis que `AWAITING_CLIENT_SIGNATURE` signifie que le client n'a pas encore signé. L'utilisateur voit donc "En attente client" pour un CRA complètement signé.

La suppression est accidentellement protégée côté UI (les deux statuts sont non-supprimables), mais le statut visible est trompeur et peut induire en erreur les actions utilisateurs (ex. régénérer un lien de signature).

**Correction requise :**
1. Ajouter `FULLY_SIGNED` dans l'enum DTO `com.timizerlike.backend.cra.dto.CraStatus`.
2. Corriger le mapper : `case FULLY_SIGNED -> CraStatus.FULLY_SIGNED;`
3. Ajouter `'FULLY_SIGNED'` dans `frontend/src/api/types.ts` (type `CraStatus`).
4. Ajouter les cas `FULLY_SIGNED` dans `statusLabel()` et `statusBadgeModifier()` dans `CraHistory.tsx` et `CraOverview.tsx`.
5. Vérifier `CraSignatureStatus.tsx` — ajouter la config pour `FULLY_SIGNED`.

### BLOQUANT 2 — `cra_not_deletable` absent de la liste `known` dans `httpClient.ts`

**Fichier :** `frontend/src/api/httpClient.ts` lignes 6-22

La fonction `toApiErrorCode()` a une liste `known` de codes reconnus. `cra_not_deletable` n'y est pas, donc quand le backend retourne 409 avec `{"error": "cra_not_deletable"}`, le frontend le catégorise en `unknown_error`. Le message spécifique "Ce CRA ne peut pas être supprimé dans son état actuel." (défini dans `errorMessages.ts`) ne sera jamais affiché.

**Correction requise :**
Ajouter `'cra_not_deletable'` dans le tableau `known` de `toApiErrorCode()` dans `httpClient.ts`.

```typescript
const known: ApiErrorCode[] = [
  ...
  'cra_not_deletable',  // ← ajouter ici
  ...
];
```

## Risques éventuels

- **Absence de tests d'intégration backend** pour `DELETE /api/cras/{id}` — aucun test ne couvre le 204 (CRA supprimable), le 409 (CRA non-supprimable), ni la suppression en cascade des enregistrements liés. Pour une opération irréversible, c'est un risque modéré.

- **`isCraDeletable()` dupliqué** dans `CraHistory.tsx` et `CraDetailModal.tsx` — si le périmètre des statuts supprimables évolue, les deux fichiers doivent être synchronisés manuellement. Risque de dérive faible mais réel. Recommandation : extraire dans un fichier partagé.

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[BLOQUANT]** Ajouter `FULLY_SIGNED` dans `CraStatus` DTO backend, corriger le mapper, et propager le statut correctement jusqu'au frontend (types, labels, badge).
2. **[BLOQUANT]** Ajouter `'cra_not_deletable'` dans la liste `known` de `toApiErrorCode()` dans `httpClient.ts`.
3. **[RECOMMANDÉ]** Ajouter au moins deux tests d'intégration backend pour `DELETE /api/cras/{id}` : un 204 sur CRA DRAFT, un 409 sur CRA AWAITING_CLIENT_SIGNATURE.
4. **[MINEUR]** Extraire `isCraDeletable()` dans un utilitaire partagé plutôt que de le dupliquer dans chaque composant.

IMPLEMENTATION_FIX_REQUIRED
