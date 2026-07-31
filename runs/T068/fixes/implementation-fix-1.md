# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T068/reviews/implementation-review.md
- generated at: 2026-07-31T23:16:13Z

---

Review complète. Décision : **IMPLEMENTATION_FIX_REQUIRED**.

---

Un seul problème bloquant identifié :

**`CraPdfDownloadService.decodeSignatureImage()` (ligne 158)** ne capture pas `IllegalArgumentException` levée par `Base64.getDecoder().decode()` quand la chaîne base64 stockée est corrompue (tronquée, caractères invalides). Ce cas produit un HTTP 500, violant le critère d'acceptation *"Corrupted signature data produces a controlled error rather than a broken or partially misleading PDF"*.

Ironie : l'ancienne méthode `decodeBase64()` (maintenant code mort, ligne 135) capturait correctement cette exception — elle a été perdue lors du refactoring vers `decodeSignatureImage()`. La correction est un simple `try/catch (IllegalArgumentException)` retournant `null`, laissant ensuite `embedSignatureImage()` afficher "Signature illisible".

Deux points mineurs également signalés : `decodeBase64()` code mort à supprimer, et une assertion de test multi-mois logiquement vide qui ne vérifie pas réellement la répétition des blocs.

IMPLEMENTATION_FIX_REQUIRED
