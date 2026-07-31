# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T067/reviews/implementation-review.md
- generated at: 2026-07-31T22:00:56Z

---

La review est rédigée. Voici la décision finale :

IMPLEMENTATION_FIX_REQUIRED

---

**Résumé de la review :**

**Un bug bloquant identifié** : `ClientSignatureService.sign()` ne met pas à jour les champs `clientRepresentativeName`, `clientSignatureDate`, et `clientSignatureImage` sur `MonthlyCraReport`. Ces champs sont lus par `CraDetailsMapper.toDto()` — après signature client, le DTO les retourne à `null`, ce qui casse l'affichage "signer names + dates" en état VALIDATED.

**Correction requise** — ajouter avant `craRepository.save(cra)` dans `ClientSignatureService.sign()` :
```java
cra.setClientRepresentativeName(signerName);
cra.setClientSignatureDate(LocalDate.now());
cra.setClientSignatureImage(signatureImageBase64);
```

**Points secondaires** (non bloquants) :
- `CraValidationBlockingReason` manque `BLANK_SIGNER_NAME` — un nom vide retourne une erreur Bean Validation 400 au lieu du format structuré `validation_blocked`
- `CraAuditServiceTest` absent (requis par le plan)
- Pas de migrations Flyway (risque opérationnel sur données existantes)
- `CraTransitionGuard` non créé (écart de plan architectural)
