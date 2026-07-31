# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T067/reviews/implementation-review.md
- generated at: 2026-07-31T22:08:09Z

---

---

## Review — T067 · Fix CRA validation workflow (attempt 4)

---

### Résumé exécutif

Le bug bloquant de la review précédente (champs client non renseignés sur `MonthlyCraReport` après signature client) est **corrigé**. Un nouveau bug de compilation a été introduit dans `ClientSignatureServiceTest` qui empêche le build des tests backend.

---

### 1. Bug bloquant — compilation error dans `ClientSignatureServiceTest`

**Fichier** : `backend/src/test/java/com/timizerlike/cra/service/ClientSignatureServiceTest.java:44`

```java
// Constructeur de ClientSignatureService attend 5 arguments :
// (tokenService, signatureRecordRepository, craRepository, objectMapper, auditService)

service = new ClientSignatureService(tokenService, recordRepository, craRepository, new ObjectMapper());
//                                                                                 ^^^^^^^^^^^^^^^^^^^^^^^^
//                                                                                 manque : auditService
```

`ClientSignatureService` (ligne 31–42 du service) a un constructeur à 5 paramètres. Le test n'en passe que 4. Ce code ne compile pas. `./mvnw test` échoue à la phase `compile-test`.

**Correction requise** :
```java
private CraAuditService auditService;  // ajouter le champ

@BeforeEach
void setUp() {
    tokenService = mock(CraSignatureTokenService.class);
    recordRepository = mock(CraClientSignatureRecordRepository.class);
    craRepository = mock(MonthlyCraReportRepository.class);
    auditService = mock(CraAuditService.class);   // ajouter
    service = new ClientSignatureService(tokenService, recordRepository, craRepository, new ObjectMapper(), auditService);
}
```

---

### 2. Correctness — fix principal appliqué ✓

`ClientSignatureService.sign()` (lignes 70–73) renseigne correctement les champs sur l'entité avant `save()` :

```java
cra.setClientRepresentativeName(signerName);
cra.setClientSignatureDate(LocalDate.now());
cra.setClientSignatureImage(signatureImageBase64);
cra.setStatus(ValidationStatus.VALIDATED);
```

La régression signalée lors de la review 3 est bien corrigée.

---

### 3. Workflow global — conforme au ticket

| Critère ticket | État |
|---|---|
| `validateCra()` exporté depuis `craClient.ts` | ✓ |
| `ValidationStatus` réduit à 3 états | ✓ |
| `CraDetailsMapper` couvre exactement les 3 états | ✓ |
| Transition DRAFT → AWAITING atomique avec hash | ✓ |
| Transition AWAITING → VALIDATED atomique | ✓ |
| `@Version` présent sur `MonthlyCraReport` | ✓ |
| `CraDayUpdateService` bloque mutation hors DRAFT | ✓ |
| `CraReopenService` revoque token + clear signatures | ✓ |
| `CraAuditService` enregistre chaque transition | ✓ |
| `CraApiExceptionHandler` retourne erreurs structurées | ✓ |
| Frontend : labels FR pour les 3 états | ✓ |
| Frontend : bouton "Valider et signer le CRA" | ✓ |
| Frontend : liste des `blockingReasons` affichée | ✓ |
| Intégration : happy path DRAFT→VALIDATED | ✓ |
| Intégration : token expiré → 410 | ✓ |
| Intégration : token déjà consommé → 410 | ✓ |
| Intégration : concurrent validations | ✓ |
| Intégration : reopen après consultant sign | ✓ |
| Intégration : reopen après both signatures | ✓ |

---

### 4. Observations non bloquantes (portées depuis review précédente)

**4a. `CraValidationBlockingReason` — `BLANK_SIGNER_NAME` absent**  
Un nom de signataire vide retourne une erreur Spring Validation 400 (format standard), pas le format structuré `{"error":"validation_blocked","reasons":[...]}`. Fonctionnellement acceptable mais incohérent avec les autres raisons de blocage. Le ticket demande des "précise blocking reasons".

**4b. `CraAuditServiceTest` absent**  
Le plan requiert un test unitaire de `CraAuditService`. Absent. `CraAuditService` est couvert indirectement par les tests d'intégration.

**4c. Pas de migrations Flyway**  
Le plan prévoyait une migration `VN__simplify_cra_status.sql` pour convertir les anciens statuts (`READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `FULLY_SIGNED`) en `DRAFT`/`VALIDATED`. Aucune migration présente. Risque opérationnel si des données avec les anciens statuts existent en base — le démarrage de l'application échouerait sur un enum invalide.

**4d. `CraReopenController` sans confirmation**  
Le plan spécifiait un flag `confirmed` côté API. L'implémentation délègue l'UX de confirmation au frontend uniquement. Acceptable si le frontend impose la dialog, mais non auditable côté backend.

---

### 5. Verdict

Un seul problème bloquant : erreur de compilation dans `ClientSignatureServiceTest:44` — argument `CraAuditService` manquant au constructeur. La correction est triviale (une ligne). Tout le reste de l'implémentation est conforme.

IMPLEMENTATION_FIX_REQUIRED
