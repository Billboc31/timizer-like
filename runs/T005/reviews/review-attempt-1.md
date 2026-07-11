# PR Review — T005 Create CRA DTOs (attempt 1)

## Résumé

Cinq types Java (`CraStatus` enum + quatre `record` DTOs) créés sous
`backend/src/main/java/com/timizerlike/backend/cra/dto/`, plus un test JUnit 5
`CraDtoTest` couvrant la construction/round-trip. Aucun fichier hors du package
DTO n’est modifié, aucune dépendance ajoutée, aucun `pom.xml` créé.

L’implémentation est conforme au ticket et au plan approuvé.

## Vérifications effectuées

- Lecture du ticket (`runs/T005/ticket.md`) et croisement avec les critères
  d’acceptation.
- Lecture du plan (`runs/T005/plan.md`) et comparaison ligne à ligne
  avec les fichiers produits.
- Inspection des cinq sources DTO et du fichier de test.
- Vérification qu’aucun fichier n’a été touché en dehors du package DTO et
  du dossier `src/test/java/.../cra/dto/` (`find backend -type f`).
- Vérification qu’aucun `pom.xml`, `Application.java` ou fichier de config
  Spring Boot n’a été introduit (cohérent avec le scope, T009 les portera).
- Vérification des skills : `workflow-discipline`, `code-quality`,
  `refactor-safety`, `security`.

## Points validés

- **Correspondance ticket ↔ plan ↔ code**
  - `CraSummaryDto` : `Long id, int month, int year, double totalWorkedDays,
    CraStatus status`. Pas de liste de jours (bon pour un endpoint de liste).
  - `CraDetailsDto` : mêmes champs + `List<CraDayEntryDto> days`.
  - `CraDayEntryDto` : `(int day, double worked)`.
  - `CraCreateOrUpdateRequestDto` : `(int month, int year, List<CraDayEntryDto> days)`
    — pas d’`id`, pas de `status`, pas de `totalWorkedDays` (conforme au plan).
  - `CraStatus` : `DRAFT`, `VALIDATED` (pas `SIGNED`, cohérent avec « signature
    client hors scope »).
- **Immutabilité et absence de logique** : tous les DTOs sont des `record`
  publics, aucun corps de méthode, aucune annotation. Aucune magie cachée.
- **Isolation** : un seul package, aucun sous-package `request/`/`response/`.
  Aucun couplage avec JPA, Jackson, Bean Validation, Lombok, MapStruct ou
  OpenAPI.
- **Dépendances** : aucune modification de build (aucun `pom.xml` présent,
  donc rien à changer).
- **Tests** : `CraDtoTest` couvre round-trip constructeur/accesseurs pour
  chaque type et l’enum. Utilise JUnit 5 (`org.junit.jupiter.api.*`),
  cohérent avec un projet Spring Boot 3 futur.
- **Scope** : REST controllers, entités JPA, calcul du total, workflow de
  statut, PDF, frontend et signature client sont intacts (aucun fichier
  concerné dans le diff).
- **Sécurité** : aucun secret, aucune I/O, aucune entrée externe traitée.
  Types de données inertes → surface d’attaque nulle.

## Problèmes détectés

Aucun problème bloquant.

## Risques éventuels

- **Non-exécution de `./mvnw test`** : le repo ne contient pas encore de
  `pom.xml` (T009 est censé le poser). L’auteur l’a explicité dans
  `implementation-output.md`. Le plan avait anticipé cette situation
  (« créer le squelette de répertoires *sans* bootstrapper Spring Boot »),
  donc ce n’est pas une violation du plan — mais l’acceptation stricte
  « `CraDtoTest` compile et passe » ne pourra être vérifiée qu’après T009.
  Impact limité : les DTOs sont triviaux, le test est standard JUnit 5, et
  le critère du ticket « existing tests still pass » est trivialement
  satisfait (aucun test préexistant).
- **Copie défensive absente** pour `List<CraDayEntryDto>` dans
  `CraDetailsDto` et `CraCreateOrUpdateRequestDto`. Le plan l’assume
  explicitement ; à noter pour la revue des tickets consommateurs
  (T007/T012) : ceux-ci devront passer des listes immuables
  (`List.copyOf(...)` ou `List.of(...)`) sous peine de fuite d’état.
- **`double` pour `worked` et `totalWorkedDays`** : le plan l’accepte au
  motif du grain demi-journée. Attention à T006 (calcul du total) et à la
  sérialisation JSON future si un jour un besoin de précision décimale
  apparaît — non bloquant ici.

## Décision

- APPROVED

## Actions demandées

Aucune. À faire suivre naturellement dans les tickets aval (non blocant
pour T005) :
- T009 : exécuter effectivement `./mvnw test` une fois le `pom.xml` posé,
  pour valider que `CraDtoTest` compile et passe comme prévu.
- T007/T012 : les callers devront passer des listes immuables aux DTOs
  (rappel documenté ci-dessus).

IMPLEMENTATION_APPROVED
