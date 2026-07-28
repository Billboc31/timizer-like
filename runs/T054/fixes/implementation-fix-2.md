# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T054/reviews/implementation-review.md
- generated at: 2026-07-28T21:49:29Z

---

I now have all I need for a complete review. Let me write it.

---

## PR Review — T054 — Client Signature Capture and Approval Page

### Résumé

L'implémentation est substantielle et bien structurée : le flux complet existe côté backend (token, service de signature, exception handler) et côté frontend (page publique, formulaire, canvas, écran de succès). Les tests unitaires et les tests e2e Playwright sont présents. Trois problèmes bloquants ont été identifiés.

---

### Vérifications effectuées

- Lecture du code source backend : `ClientSignatureService`, `CraSignatureTokenService`, `CraApiExceptionHandler`, `CraValidationService`, `ValidationStatus`
- Lecture du code source frontend : `apiError.ts`, `httpClient.ts`, `ClientSignatureForm`, `SignatureCanvas`
- Lecture des tests : `ClientSignatureServiceTest`, `PublicCraSigningControllerTest`, `CraSignatureWorkflowIntegrationTest`, `client-signing.spec.ts`, `publicSignature.spec.ts`

---

### Points validés

- Signer name requis, trimmé avant envoi
- Consent checkbox obligatoire, vérifié côté client et côté serveur
- Canvas signature : PointerEvents (souris + touch), `touchAction: 'none'`, `isEmpty()` vérifié avant soumission
- Token à usage unique : `TokenAlreadyConsumedException` levée en base, 410 GONE renvoyé
- Snapshot CRA sérialisé en JSON à l'instant de signature (audit trail immutable)
- Timestamp `Instant.now()` persisté dans `CraClientSignatureRecord`
- Écran de succès avec nom du signataire et date (fr-FR)
- Tests unitaires backend : 18 cas `ClientSignatureServiceTest`, 8 cas `PublicCraSigningControllerTest`
- Tests composant frontend : `SignatureCanvasTest`, `ClientSignatureFormTest`, `CraSignaturePageTest`
- Tests e2e Playwright : `client-signing.spec.ts` (4 scénarios), `publicSignature.spec.ts` (2 scénarios)

---

### Problèmes détectés

#### BLOQUANT 1 — Mauvais statut final : `VALIDATED` au lieu de `FULLY_SIGNED`

**Fichier** : `ClientSignatureService.java:65`

```java
cra.setStatus(ValidationStatus.VALIDATED);
```

`ValidationStatus` possède les deux valeurs `FULLY_SIGNED` et `VALIDATED`. `FULLY_SIGNED` est dans l'enum mais n'est **jamais utilisé**. `VALIDATED` est le statut terminal de l'ancien flux mono-signataire (`CraValidationService.validate()` ligne 35), qui part de `DRAFT`. Le nouveau flux deux-signataires (`AWAITING_CLIENT_SIGNATURE → client sign`) arrive dans le même statut `VALIDATED`, rendant les deux chemins indiscernables a posteriori.

La correction attendue : `cra.setStatus(ValidationStatus.FULLY_SIGNED)`.

---

#### BLOQUANT 2 — Mismatch d'error codes entre backend et frontend

**Fichiers** : `CraApiExceptionHandler.java:95` / `httpClient.ts:6-19` / `apiError.ts:1-15`

Le backend émet `"invalid_signature_image"` (handler ligne 95). Le frontend reconnaît `"signature_too_large"` et `"signature_invalid_format"` (qui ne sont **jamais émis par le backend**). La valeur `"invalid_signature_image"` tombe donc dans `unknown_error` — feedback utilisateur dégradé.

Corrections attendues :
- Ajouter `'invalid_signature_image'` à `apiError.ts` et à la liste `known` de `httpClient.ts`
- Supprimer `'signature_too_large'` et `'signature_invalid_format'` (dead codes)

---

#### BLOQUANT 3 — Test d'intégration tronqué

**Fichier** : `CraSignatureWorkflowIntegrationTest.java:142`

Le test `fullSignatureWorkflow` s'arrête à l'assertion `AWAITING_CLIENT_SIGNATURE` (ligne 141). Il ne teste pas :
- la soumission effective de la signature client (`POST /public/cra-link/{token}/sign`)
- la transition vers le statut final
- l'impossibilité d'utiliser le même token deux fois
- la persistance du `CraClientSignatureRecord`

C'est le seul test d'intégration du ticket, et il ne couvre pas la partie critique ajoutée par T054.

---

### Risques éventuels (non bloquants)

- **Aucune expiration de token** : les tokens sont valides indéfiniment. Non requis par l'AC, mais risque à documenter pour la roadmap sécurité.
- **Pas de limite de taille sur `signatureImageBase64`** : une image très large peut être persistée. Validation uniquement sur le préfixe `data:image/`, pas sur la taille. Vecteur de stockage abusif potentiel.

---

### Décision

REQUEST_CHANGES — trois corrections bloquantes requises avant approbation.

### Actions demandées

1. **`ClientSignatureService.java:65`** — remplacer `ValidationStatus.VALIDATED` par `ValidationStatus.FULLY_SIGNED`
2. **`apiError.ts` + `httpClient.ts`** — remplacer `signature_too_large` et `signature_invalid_format` par `invalid_signature_image` dans la liste des codes connus
3. **`CraSignatureWorkflowIntegrationTest.java`** — compléter `fullSignatureWorkflow` avec : appel `POST /public/cra-link/{token}/sign`, assertion statut `FULLY_SIGNED`, tentative de re-signature avec le même token (assertion 410 GONE)

---

IMPLEMENTATION_FIX_REQUIRED
