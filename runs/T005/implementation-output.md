All six files are in place under `backend/src/main/java/com/timizerlike/backend/cra/dto/` and `backend/src/test/java/com/timizerlike/backend/cra/dto/`, per the approved plan.

## Résumé des changements

Cinq DTOs/enum (records Java immuables, un type par fichier, aucune annotation, aucune logique) plus un test unitaire vérifiant construction et accessors.

## Fichiers créés

- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraStatus.java` — enum `DRAFT`, `VALIDATED`
- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraDayEntryDto.java` — `(int day, double worked)`
- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraSummaryDto.java` — `(Long id, int month, int year, double totalWorkedDays, CraStatus status)`
- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraDetailsDto.java` — summary + `List<CraDayEntryDto> days`
- `backend/src/main/java/com/timizerlike/backend/cra/dto/CraCreateOrUpdateRequestDto.java` — `(int month, int year, List<CraDayEntryDto> days)` (pas d'`id`, `status`, `totalWorkedDays`)
- `backend/src/test/java/com/timizerlike/backend/cra/dto/CraDtoTest.java` — round-trip constructeur/accesseurs pour chaque type

## Vérifications effectuées

- Chaque DTO déclare exactement les champs et le type listés dans le plan (records publics, package unique `com.timizerlike.backend.cra.dto`, aucun sous-package).
- `CraDetailsDto` expose bien `List<CraDayEntryDto> days` ; `CraSummaryDto` ne l'expose pas.
- `CraCreateOrUpdateRequestDto` n'expose ni `id`, ni `status`, ni `totalWorkedDays`.
- Aucun fichier hors du package DTO (et du test) créé/modifié.
- Aucune dépendance ajoutée (ni Lombok, ni Jackson, ni validation, ni annotations OpenAPI).

## Limites connues / hypothèses

- **Aucun `pom.xml` n'existe encore** dans le repo. Le plan demande explicitement de créer le squelette de répertoires *sans* bootstrapper Spring Boot (`pom.xml`, `Application.java`, config) — c'est le scope de T009. J'ai donc écrit les sources Java brutes, mais **`./mvnw test` ne peut pas être exécuté** dans cette PR : la vérification "CraDtoTest compile et passe" ne pourra être réalisée qu'après T009. Le test lui-même est écrit contre JUnit 5 (`org.junit.jupiter.api.*`), l'API standard attendue par un projet Spring Boot 3.
- Aucun test préexistant dans le repo : la clause "existing tests still pass" est trivialement satisfaite.
- La copie défensive de `List<CraDayEntryDto>` dans `CraDetailsDto` / `CraCreateOrUpdateRequestDto` n'est pas faite, conformément au plan (le caller est censé passer une liste immuable).
