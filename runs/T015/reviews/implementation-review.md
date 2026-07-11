Review complete. Written to `runs/T015/reviews/review-attempt-1.md`.

# PR Review

## Résumé

Implémentation du ticket T015 : nouveau modèle de données PDF pour rendre un CRA, sous forme de records Java immuables dans `com.timizerlike.cra.pdf.model`. L'implémentation suit fidèlement le plan approuvé et respecte le scope.

## Vérifications effectuées

- Lecture du ticket, du plan et des 11 fichiers créés
- `git diff --stat` : uniquement des créations dans le package cible + artefacts de run
- Aucun fichier existant modifié, aucune dépendance ajoutée

## Points validés

- **AC1** — `CraPdfDocument` agrège page1/page2Days/signatures
- **AC2** — `CraPdfSummary` porte période, provider, client, total (tous les champs du ticket sont couverts)
- **AC3** — `CraPdfDayEntry` (date, dayOfWeek, type, workedFraction, comment) + enum `CraPdfDayType`
- **AC4** — `CraPdfProviderSignature` avec name/signedAt/signatureImageRef
- **AC5** — `CraPdfClientSignature` avec 3 champs nullables (test dédié)
- **Scope** : rien hors périmètre (pas de rendu, endpoint, UI, capture signature, frais)
- **Qualité** : records immuables, noms explicites, `package-info.java` scopant, pas de magie
- **Sécurité** : données inertes, aucun secret, aucun log

## Problèmes détectés

Aucun bloquant. Mineur : `assertThat(document.page2Days()).isSameAs(document.page2Days())` (test line 81) est une tautologie — à remplacer par une vraie assertion.

## Risques éventuels

Cette branche isolée n'a pas de `pom.xml`, donc `mvn test` ne peut pas être exécuté ici. Le coder l'a documenté ; la vérification aura lieu au merge avec les branches d'infrastructure.

## Décision

APPROVED

IMPLEMENTATION_APPROVED
