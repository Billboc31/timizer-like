# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T054/reviews/implementation-review.md
- generated at: 2026-07-28T22:16:22Z

---

Now I have everything I need. Let me write the review.

---

# PR Review — T054: Add client signature capture and approval page

## Résumé

Implémentation du formulaire de signature client sur la page publique CRA (31 fichiers source). Le périmètre est respecté : capture de signature tactile/souris, consentement explicite, identité signataire, snapshot du CRA, consommation du token, transition `AWAITING_CLIENT_SIGNATURE → FULLY_SIGNED`. Le fix de la review précédente (test inatteignable 409) a bien été appliqué. Un **bug bloquant** est identifié dans la couche HTTP frontend qui rend le flux de signature non fonctionnel en production.

## Vérifications effectuées

- Lecture de `runs/T054/reviews/implementation-review.md` (review précédente)
- Vérification que le fix demandé (suppression `returns409WhenCraNotInSignedByProviderStatus`) a bien été appliqué dans `PublicCraSigningControllerTest.java`
- Lecture de tous les fichiers clés : `ClientSignatureService.java`, `CraSignatureTokenService.java`, `PublicCraSigningController.java`, `CraApiExceptionHandler.java`, `CraSignatureToken.java`, `CraClientSignatureRecord.java`, `ValidationStatus.java`
- Lecture du frontend : `httpClient.ts`, `craPublicClient.ts`, `CraSignaturePage.tsx`, `ClientSignatureForm.tsx`, `SignatureCanvas.tsx`, `SigningSuccessScreen.tsx`, `main.tsx`
- Lecture des tests : `PublicCraSigningControllerTest.java` (6 tests, 409 retiré ✅), `CraSignatureWorkflowIntegrationTest.java`, `ClientSignatureForm.test.tsx`, `CraSignaturePage.test.tsx`, `client-signing.spec.ts`, `publicSignature.spec.ts`
- Vérification croisée des comportements HTTP backend/frontend

## Points validés

- **Sécurité token** : 32 bytes via `SecureRandom`, SHA-256 persisté uniquement. Correct.
- **Consommation idempotente** : `validateAndConsume` vérifie `isConsumed()` ET le statut CRA (`AWAITING_CLIENT_SIGNATURE`) avant de marquer `consumedAt`. Rollback transactionnel si erreur post-consommation. Correct.
- **Ordre de validation** : consentement et format d'image validés _avant_ la consommation du token (échec anticipé sans brûler le lien). Correct.
- **Snapshot** : CRA sérialisé en JSON au moment de la signature et stocké dans `cra_content_snapshot`. Immuable par construction. Correct.
- **Submit gating** : bouton désactivé jusqu'à `signerName.trim().length > 0 && consentApproved && padNonEmpty && !submitting`. Correct.
- **Canvas signature** : implémentation custom Pointer Events API — `touchAction: none`, `setPointerCapture`, `onPointerLeave` protège contre les glissements hors canvas. Correct.
- **Test unitaires backend** : `ClientSignatureServiceTest`, `CraSignatureTokenServiceTest` couvrent happy path, consent false, format image invalide, token consommé/introuvable. Correct.
- **Intégration** : `CraSignatureWorkflowIntegrationTest` valide le workflow complet DRAFT → FULLY_SIGNED et le 410 sur re-soumission. Correct.
- **Fix précédent appliqué** : `PublicCraSigningControllerTest.java` ne contient plus que 6 tests, le cas `returns409WhenCraNotInSignedByProviderStatus` est supprimé. ✅

## Problèmes détectés

### 1. [BLOQUANT] `handleResponse<T>` appelle `res.json()` sur un body 200 vide — le flux de signature est non fonctionnel

**Fichier** : `frontend/src/api/httpClient.ts:27`

```typescript
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    return res.json() as Promise<T>;  // ← bug
  }
  ...
}
```

`POST /public/cra-link/{token}/sign` → `PublicCraSigningController.sign()` retourne `void` → Spring écrit une réponse HTTP 200 avec un **body vide** (Content-Length: 0).

`apiPost<void>` → `handleResponse<void>` → `res.json()` sur un body vide → `SyntaxError: Unexpected end of JSON input`.

Ce `SyntaxError` n'est pas une `ApiError`, donc le `catch` de `handleSubmit` entre dans la branche générique et affiche `"Une erreur est survenue. Veuillez réessayer."`. `onSuccess` n'est jamais appelé, l'écran de succès n'est jamais affiché.

**Le flux de signature est intégralement cassé en production.**

Note : les 207 tests passent parce que les tests composants Vitest mockent `submitClientSignature` directement (bypass de la couche HTTP), et les tests Playwright ont des mocks réseau qui retournent `{ status: 200, body: '' }` — ces E2E tests sont eux-mêmes supposément écrits pour capturer ce bug, mais ils n'ont pas été exécutés dans la passe "207 tests pass" (Playwright s'exécute séparément).

**Correction attendue** : modifier `handleResponse` pour gérer le body vide :

```typescript
async function handleResponse<T>(res: Response): Promise<T> {
  if (res.ok) {
    const text = await res.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  }
  ...
}
```

### 2. [Mineur] `data-testid="signature-canvas"` silencieusement ignoré

**Fichier** : `frontend/src/components/ClientSignatureForm/ClientSignatureForm.tsx:111`

```tsx
<SignatureCanvas
  ref={canvasRef}
  onDraw={() => setPadNonEmpty(true)}
  data-testid="signature-canvas"   // ← non défini dans Props, non transmis au DOM
/>
```

L'interface `Props` de `SignatureCanvas` n'inclut pas `data-testid` et ne spread pas les HTML attributes sur l'élément `<canvas>`. TypeScript devrait le signaler. Les tests utilisent `getByRole('img')` et ne dépendent pas de ce testid — donc pas de cassure fonctionnelle — mais c'est un bruit au niveau des types.

## Risques éventuels

- **Race condition token** (déjà identifié en review précédente, toujours présent) : `validateAndConsume` ne pose pas de `SELECT FOR UPDATE`. Risque théorique faible en pratique pour un lien à usage unique.
- **`VALIDATED` vs `FULLY_SIGNED`** (déjà identifié, toujours présent) : coexistence de deux valeurs dans `ValidationStatus`. Sans impact fonctionnel immédiat.

## Décision

Le fix de la review précédente est correctement appliqué. L'implémentation backend est correcte et bien testée.

Cependant, un bug bloquant (#1) rend le flux de signature inopérant en production : `handleResponse<T>` appelle `res.json()` sur un body vide et lève une `SyntaxError` capturée comme erreur générique, empêchant l'affichage de l'écran de succès. Ce bug est masqué par le choix des mocks dans les tests (Vitest bypasse la couche HTTP, Playwright non exécuté dans le comptage "207 tests").

## Actions demandées

1. **`frontend/src/api/httpClient.ts:27`** — remplacer `return res.json() as Promise<T>;` par une lecture du texte avec gestion du body vide (voir correction proposée au point #1). Mettre à jour le test `api/__tests__/httpClient.test.ts` pour couvrir le cas 200 avec body vide.

IMPLEMENTATION_FIX_REQUIRED
