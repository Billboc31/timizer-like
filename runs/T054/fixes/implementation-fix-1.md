# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T054/reviews/implementation-review.md
- generated at: 2026-07-28T21:38:46Z

---

Now I'll write the formal review.

---

# PR Review — T054: Client signature capture and approval page

## Résumé

L'implémentation couvre l'ensemble du workflow : formulaire de signature client (nom, rôle optionnel, consentement explicite, canvas HTML5 pointer-events), endpoint `POST /public/cra-link/{token}/sign`, consommation one-shot du token, persistance du snapshot CRA, transition vers `VALIDATED`. La couverture de tests est solide (unit, integration, component, E2E). Deux problèmes bloquants empêchent cependant le merge : une migration Flyway manquante et un mapping d'exception incomplet.

---

## Vérifications effectuées

- Lecture du ticket, du plan, et de tous les fichiers impactés
- Vérification de l'arborescence `backend/src/main/resources/` → absence de migration SQL
- Vérification de `CraApiExceptionHandler` → `IllegalArgumentException` non mappée
- Comparaison plan ↔ implémentation (URL, nommage composants, dépendance npm)
- Lecture de `ClientSignatureService`, `CraSignatureTokenService`, `CraSignatureToken`, `CraApiExceptionHandler`, `ClientSignatureRequestDto`
- Lecture des tests backend (6 unit + 6 integration) et frontend (11 component + 4 E2E)

---

## Points validés

- **AC 1 — Revue complète avant signature** : `CraSignaturePage` affiche le CRA complet avant le formulaire. ✓  
- **AC 2 — Nom et consentement obligatoires** : `@NotBlank signerName`, checkbox consentement requise, double validation frontend et backend (`ConsentNotGivenException`). ✓  
- **AC 3 — Mouse et touch** : `SignatureCanvas` utilise l'API Pointer (events `onPointerDown/Move/Up`), `touch-action: none`. ✓  
- **AC 4 — Signature vide non soumettable** : `isEmpty()` via `hasDrawn` ref, submit désactivé frontend, vérification backend (`@NotBlank` + prefix). ✓  
- **AC 5 — Persistance complète** : `CraClientSignatureRecord` stocke `signerName`, `signerRole`, `consentApproved`, `signatureImageBase64`, `craContentSnapshot` (JSON snapshot), `signedAt`. ✓  
- **AC 6 — Token one-shot** : `isConsumed()` / `consume()` sur `CraSignatureToken.consumedAt`, 410 Gone sur réutilisation. ✓  
- **AC 7 — Confirmation succès** : `SigningSuccessScreen` avec nom du signataire et date. ✓  
- **Tests** : `ClientSignatureServiceTest` (6), `PublicCraSigningControllerTest` (6), `SignatureCanvas.test.tsx` (3 isEmpty tests ajoutés), `ClientSignatureForm.test.tsx` (11), `client-signing.spec.ts` (4 E2E). ✓  
- Gestion transactionnelle propre dans `ClientSignatureService`. ✓  
- Mapping des exceptions `TokenAlreadyConsumedException` (410) et `ConsentNotGivenException` (400) dans `CraApiExceptionHandler`. ✓  

---

## Problèmes détectés

### BLOQUANT 1 — Migration Flyway absente

Le plan exige explicitement `V{n}__add_cra_client_signature_record.sql`. L'arborescence `backend/src/main/resources/` ne contient que `application.yml` — aucun répertoire `db/migration/` ni fichier SQL.

Deux schémas sont concernés :
- **Nouvelle table** `cra_client_signature_record` (colonnes : `id`, `cra_id`, `token_id`, `signer_name`, `signer_role`, `consent_approved`, `signature_image_base64`, `cra_content_snapshot`, `signed_at`)
- **Colonne ajoutée** `consumed_at` sur `cra_signature_token` (ligne 31 de `CraSignatureToken.java`)

Sans ces migrations, l'application ne démarre pas en staging/production.

**Correction attendue** : créer les fichiers de migration Flyway correspondants.

---

### BLOQUANT 2 — `IllegalArgumentException` retourne 500 au lieu de 400

`ClientSignatureService.java:46` lève `IllegalArgumentException("Invalid signature image")` lorsque la signature ne commence pas par `data:image/`. Cette exception n'est pas mappée dans `CraApiExceptionHandler` : Spring retourne 500 par défaut.

Le plan stipule : "blank or absent `signatureImageBase64` → 400 Bad Request". Le `@NotBlank` du DTO intercepte les cas vides à la couche contrôleur, mais le contrôle du préfixe `data:image/` n'est effectué qu'au niveau service et produit un 500 si une valeur bien formée mais invalide est envoyée.

**Correction attendue** : soit ajouter un handler `@ExceptionHandler(IllegalArgumentException.class)` dans `CraApiExceptionHandler` retournant 400, soit créer une exception dédiée `InvalidSignatureImageException` (plus propre) et la mapper.

---

## Risques éventuels

**Mineur — Déviation plan sur la dépendance npm** : le plan demandait la bibliothèque `signature_pad`. L'implémentation utilise un canvas natif avec Pointer API. Le résultat est fonctionnel mais la robustesse cross-browser du canvas natif (notamment gestion des marges en cas de scroll, DPR/retina) est moins testée qu'une librairie dédiée. À surveiller.

**Mineur — Race condition sur consommation du token** : `validateAndConsume` fait un read-then-write sans lock optimiste ni contrainte DB d'unicité. En cas de requêtes parallèles, deux consommations simultanées sont théoriquement possibles. Une contrainte `UNIQUE` sur `consumed_at` ou un `SELECT ... FOR UPDATE` renforcerait la fiabilité.

**Mineur — Test E2E touch manquant** : le plan mentionne "Playwright touch emulation" pour valider la saisie tactile. `client-signing.spec.ts` utilise uniquement `mouse.move`. L'AC "touch" est couverte par le Pointer API au niveau composant, mais pas en E2E.

**Mineur — URL path diffère du plan** : le plan spécifie `POST /api/public/cra/{token}/sign`, l'implémentation utilise `POST /public/cra-link/{token}/sign`. La cohérence avec T053 semble maintenue (les deux endpoints GET/POST utilisent le même préfixe), donc non bloquant.

---

## Décision

- ~~APPROVED~~
- **REQUEST_CHANGES**

---

## Actions demandées

1. **(Bloquant)** Créer `V{n}__add_cra_client_signature_record.sql` avec la définition complète de la table `cra_client_signature_record`.
2. **(Bloquant)** Créer `V{n}__add_consumed_at_to_cra_signature_token.sql` pour ajouter la colonne `consumed_at TIMESTAMP` sur `cra_signature_token`.
3. **(Bloquant)** Mapper `IllegalArgumentException` (ou créer `InvalidSignatureImageException`) → 400 Bad Request dans `CraApiExceptionHandler`.

IMPLEMENTATION_FIX_REQUIRED
