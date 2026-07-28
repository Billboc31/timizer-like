# PR Review — T053 : Lien public de signature client pour un CRA

## Résumé

L'implémentation ajoute un mécanisme de token cryptographique (256-bit SecureRandom, stocké en SHA-256) permettant au prestataire de générer un lien public non-devinable pour qu'un client valide un CRA signé, sans compte applicatif. Les endpoints `POST/DELETE /api/cras/{id}/signature-link` et `GET /public/cra-link/{token}` sont implémentés avec une page frontend read-only sur `/sign/{token}`. Tous les critères d'acceptance du ticket sont couverts.

## Vérifications effectuées

- Lecture du plan (`runs/T053/plan.md`) et du ticket
- Lecture complète : `CraSignatureToken.java`, `CraSignatureTokenRepository.java`, `CraSignatureTokenService.java`, `CraSignatureLinkController.java`, `PublicCraViewController.java`, `CraApiExceptionHandler.java`, `CraPublicViewDto.java`
- Lecture complète : `CraSignaturePage.tsx`, `main.tsx`, `craPublicClient.ts`, `craPublicView.ts`
- Lecture des tests : `CraSignatureTokenServiceTest.java`, `CraSignatureLinkControllerTest.java`, `CraSignaturePage.test.tsx`, `publicSignature.spec.ts`
- Vérification de l'absence de Spring Security (pas de dépendance dans `pom.xml`)
- Vérification `application.yml` : `ddl-auto: update` (Hibernate gère le schéma, pas de migration SQL manuelle)

## Points validés

### Sécurité token
- **Entropie** : 32 bytes de `SecureRandom` → 256 bits, encodé en base64url sans padding. Non-devinable.
- **Stockage** : seul le digest SHA-256 (64 hex chars) est persisté dans `token_hash`. Le token brut n'est jamais stocké.
- **Logging** : le token brut n'est jamais loggué dans le service — seul le hash est manipulé après la génération.
- **Anti-oracle** : `TokenNotFoundException` unique pour tous les cas (token inconnu, révoqué, CRA déjà validé). HTTP 404 + `{"error":"token_invalid"}` dans tous les cas.

### Gestion du cycle de vie
- `generateToken()` : vérifie `SIGNED_BY_PROVIDER`, supprime l'éventuel token existant (`deleteByCraId` + `flush()`), puis sauvegarde le nouveau. La régénération fonctionne.
- `resolveToken()` : revalide le statut du CRA au moment de la résolution — si le CRA passe à `VALIDATED` entre la génération et l'accès, le lien devient invalide. Le ticket ("must expire or become unusable after the client signs") est couvert.
- `revokeToken()` : suppression physique de la ligne. Idempotent.

### Exposition des données
- `CraPublicViewDto` : aucun `id`, `status`, `updatedAt`, ni clé étrangère interne. Uniquement : mois/année, nom/société prestataire, nom/société/email contact client, date de signature prestataire, total jours travaillés, détail journalier.
- Le test `getPublicCraExposesNoIdOrStatus` vérifie l'absence de ces champs dans la réponse JSON.

### Contrôle d'accès
- `POST/DELETE` : dans le namespace `/api/cras/` (même niveau que les endpoints existants, sans auth ajoutée — cohérent avec le plan qui exclut explicitement Spring Security).
- `GET /public/cra-link/{token}` : sans auth, par design documenté dans le plan.

### Tests
- **Unitaires service** (12 tests Mockito) : génération, rejet DRAFT/VALIDATED, hash vs raw, régénération, résolution valide, token inconnu/révoqué/CRA changé de statut, révocation.
- **Contrôleurs** (8 tests `@WebMvcTest`) : tous les endpoints, tous les codes HTTP, vérification absence `id`/`status` dans le JSON public.
- **Frontend** (6 tests Vitest + RTL) : loading, données CRA, table journalière, erreur 404, erreur réseau.
- **E2E** (2 tests Playwright) : token valide → affichage CRA, token invalide → message d'erreur générique.

### Scope
- Aucune dérive hors-scope détectée. Email, capture de signature client, auth client : absents.
- Les corrections de tests pré-existants (`CraControllerTest` arity, imports axe) sont appropriées et nécessaires.

## Problèmes détectés

### Observation 1 — Dead code : `revokedAt` jamais peuplé, `isRevoked()` inaccessible en production (non bloquant)

**Localisation** : `CraSignatureToken.java` (champ `revokedAt`, méthode `isRevoked()`), `CraSignatureTokenService.java` ligne 68-70.

Le plan spécifie `revokedAt Instant (nullable)` dans l'entité, suggérant une soft-delete. Mais `revokeToken()` effectue une **hard delete** via `deleteByCraId()`. Résultat :

- `revokedAt` n'est jamais assigné nulle part dans le code — la colonne est toujours `null` en base.
- `isRevoked()` retourne toujours `false` en production.
- Le bloc `if (token.isRevoked())` dans `resolveToken()` (ligne 68-70) est du dead code : un token révoqué n'existe plus en base, donc `findByTokenHash()` retourne `Optional.empty()` et l'exception est levée à la ligne 66.

La révocation **fonctionne correctement** via la hard delete — ce n'est pas un bug fonctionnel. Mais le code est trompeur : il ressemble à une vérification de sécurité critique alors qu'il est inatteignable.

**Correction suggérée** (non bloquante) : soit supprimer `revokedAt`, `isRevoked()`, et le check associé pour clarifier l'intention hard-delete, soit commenter explicitement le choix.

### Observation 2 — Test `resolveTokenThrowsForRevokedToken` teste un chemin de code impossible (non bloquant)

**Localisation** : `CraSignatureTokenServiceTest.java` lignes 144-151.

Le test mocke `token.isRevoked()` pour retourner `true`. En production, ce chemin ne peut jamais être atteint car un token révoqué est physiquement supprimé. Le test vérifie un comportement correct (`TokenNotFoundException`) mais via un scénario fictif.

**Correction suggérée** : le test devrait vérifier que `findByTokenHash()` retourne `Optional.empty()` (ce qui est le cas réel après révocation), ce que `resolveTokenThrowsForUnknownHash` couvre déjà. Le test actuel est redondant et donne une fausse confiance.

### Observation 3 — Absence de contrainte unique sur `cra_id` en base (non bloquant)

**Localisation** : `CraSignatureToken.java`, colonne `cra_id`.

Il n'existe pas de contrainte `UNIQUE` sur `cra_id` — la garantie "au plus un token par CRA" repose uniquement sur le `deleteByCraId()` avant sauvegarde dans `generateToken()`. Un appel concurrent à `generateToken()` pour le même CRA pourrait théoriquement créer deux entrées. En pratique, le cas est improbable et SQLite sérialise les écritures, mais c'est une fragilité de modèle.

### Observation 4 — Construction d'URL depuis `HttpServletRequest` (information)

**Localisation** : `CraSignatureLinkController.buildSignatureUrl()`.

Si l'application est derrière un reverse proxy (nginx, Caddy, etc.) sans forwarding des headers `X-Forwarded-Proto`/`X-Forwarded-Host`, l'URL générée sera en `http://internal-host:port/sign/...` au lieu du schéma public. Ce n'est pas un bug dans le contexte actuel (SQLite local, pas de proxy), mais à documenter avant un déploiement en production.

## Risques éventuels

- **Token en URL path** : le token brut figure dans le chemin (`/sign/{token}`), donc dans les logs d'accès serveur, l'historique navigateur, les headers Referer. C'est inévitable pour ce type de lien et conforme aux pratiques standard (DocuSign, liens de partage Google). Acceptable.
- **Pas de rate limiting** sur `GET /public/cra-link/{token}` : non nécessaire avec 256 bits d'entropie (force brute impossible), mais à noter pour un audit de sécurité futur.
- **Pas de CORS explicite** : si le frontend est servi depuis une origine différente du backend en production, des problèmes CORS pourraient survenir sur le endpoint public. À vérifier lors de la mise en production.

## Décision

- APPROVED

Tous les critères d'acceptance du ticket sont satisfaits. Les problèmes détectés sont des observations de code quality (dead code, test redondant) qui n'affectent ni la correction fonctionnelle, ni la sécurité du mécanisme. La révocation fonctionne, les tokens sont correctement hachés, les données exposées sont correctement filtrées, et les tests couvrent les cas valides et invalides.

## Actions demandées

Aucune action bloquante. Les observations suivantes sont recommandées pour un ticket de nettoyage ultérieur :

1. Supprimer `revokedAt`, `isRevoked()`, et le bloc `if (token.isRevoked())` dans `resolveToken()`, ou documenter explicitement le choix hard-delete vs soft-delete.
2. Remplacer ou supprimer `resolveTokenThrowsForRevokedToken` (teste un chemin impossible) — `resolveTokenThrowsForUnknownHash` couvre déjà le cas réel.
3. Ajouter `@Column(name = "cra_id", nullable = false, unique = true)` pour enforcer l'unicité en base.

IMPLEMENTATION_APPROVED
