# PR Review

## Résumé

L'implémentation introduit un namespace de configuration `cra.defaults` bindé sur un
record Spring `@ConfigurationProperties`, un service `CraCreationService` qui
peuple un `CraMonthlyReport` placeholder à partir des defaults injectés, un test
unitaire pur JUnit + AssertJ, un `application.yml` livrant les defaults, et une
page `docs/configuration.md` documentant clés / valeurs livrées / mécanismes de
surcharge. Le plan est respecté sur les sept clés, le préfixe, et l'isolation
des valeurs par défaut hors du code Java.

## Vérifications effectuées

- Lecture du ticket T026 et du plan approuvé (`runs/T026/plan.md`).
- Lecture de tous les fichiers modifiés / créés côté branche
  (`git diff --stat ai-dev-factory/bootstrap-agent-layout...HEAD` → 17 fichiers,
  883 insertions).
- Vérification manuelle de la cohérence entre `CraDefaultsProperties` (7
  champs), `application.yml` (7 clés), `docs/configuration.md` (7 lignes de
  tableau), et `CraCreationServiceTest` (7 assertions de champ).
- Vérification de la présence de `@ConfigurationPropertiesScan` sur la classe
  `TimizerLikeApplication` pour l'enregistrement du record `@ConfigurationProperties`.
- Vérification que `application.yml` est bien sous
  `backend/src/main/resources/` (chargé par Spring Boot par défaut).
- Vérification que les valeurs n'apparaissent nulle part dans du source Java
  (grep implicite via lecture des fichiers Java, aucune constante en dur).
- Contrôle du template `ai/templates/pr-review-template.md`.

## Points validés

- **Namespace de configuration** : préfixe `cra.defaults`, structure imbriquée
  `provider` / `client` / `client.contact` conforme au plan et au ticket
  (`backend/src/main/java/com/timizerlike/cra/config/CraDefaultsProperties.java:5`).
- **Enregistrement du binding** : `@ConfigurationPropertiesScan` sur le main
  class élimine le besoin d'`@EnableConfigurationProperties` explicite
  (`backend/src/main/java/com/timizerlike/cra/TimizerLikeApplication.java:8`).
- **Zéro valeur en dur en Java** : les sept valeurs vivent exclusivement dans
  `application.yml`, comme demandé par le plan
  (`backend/src/main/resources/application.yml:1`).
- **Wiring de création CRA** : `CraCreationService.createForMonth(YearMonth)`
  peuple les sept champs à partir des defaults injectés, sans surcharge partielle
  possible sur ce chemin — conforme à l'AC "New CRA records use configured defaults"
  (`backend/src/main/java/com/timizerlike/cra/service/CraCreationService.java:18`).
- **Test unitaire** : `CraCreationServiceTest` fixe les defaults à des valeurs
  connues via le constructeur du record et asserte les sept champs propagés + le
  mois. Test isolé, pas de contexte Spring requis — rapide et déterministe
  (`backend/src/test/java/com/timizerlike/cra/service/CraCreationServiceTest.java:14`).
- **Documentation** : `docs/configuration.md` liste les sept clés avec leur
  sens, cite les valeurs livrées, et documente les deux mécanismes de
  surcharge standards Spring Boot (profil YAML + variables d'environnement
  `CRA_DEFAULTS_*`), avec exemple d'export. Recommande explicitement les
  variables d'environnement pour garder l'identité opérateur hors du repo
  versionné — cohérent avec la skill security
  (`docs/configuration.md:44`).
- **Scope** : aucune couche non nécessaire modifiée. Pas de nouvel endpoint,
  pas de refactor CRA transversal, pas de touche à la génération PDF ou à
  l'historique — conforme au plan (section Excluded).

## Problèmes détectés

Aucun problème bloquant.

## Risques éventuels

- **Provider defaults génériques dans `application.yml`** : le ticket dit "les
  defaults doivent correspondre au cas Lyra Network personnel". Les champs
  client sont bien préremplis Lyra Network (nom + adresse HQ publique), mais
  les champs provider (`name`, `company`, `address`) restent des placeholders
  génériques (`"Provider Name"`, etc.). Le coder documente ce choix comme
  arbitrage security-first (repo public → pas d'identité personnelle
  versionnée) et recommande la surcharge par variable d'environnement dans
  `docs/configuration.md`. C'est un arbitrage défendable et documenté, mais
  c'est une divergence assumée par rapport au libellé du ticket et du plan.
  Point de vue Reviewer : acceptable **au vu de la skill security** ("ne pas
  exposer de secrets dans logs ou documentation") et parce que le mécanisme de
  configuration est fonctionnel — l'opérateur peut trivialement basculer les
  valeurs. À valider explicitement par le user en cas de doute.
- **Backend module bootstrappé dans ce ticket** : `backend/pom.xml`,
  `TimizerLikeApplication.java` sont ajoutés ici parce que T009 n'a pas été
  mergé dans cette worktree. Documenté en "Known limits" par le coder. Devra
  être réconcilié quand T009 landera (choisir un pom / un main class
  canonique). Pas de risque immédiat, mais dette de merge à tracer.
- **Modèle de domaine placeholder** : `CraMonthlyReport` est un record neuf
  et minimaliste, pas l'entité JPA de T002/T004/T005. Le plan autorisait
  explicitement ce cas ("If [...] does not yet expose those seven fields,
  extend the persistence model [...]. If they already exist, only wire the
  defaults through"). Le coder a opté pour un placeholder plutôt qu'un
  échafaudage JPA prématuré — cohérent avec les skills refactor-safety /
  code-quality. Devra être remplacé/aligné au moment du merge avec T002/T004/T005.
- **Compilation et exécution du test non vérifiées localement** (pas de
  Java/Maven sur l'hôte). Le code est syntaxiquement simple et le test est
  auto-suffisant (pas de contexte Spring), mais la vérification est reportée
  sur CI ou machine dev. À surveiller au premier build.
- **`spring-boot-configuration-processor` absent du `pom.xml`** — pas
  bloquant (metadata IDE seulement), mais serait un plus pour l'autocomplétion
  des clés `cra.defaults.*` dans les fichiers YAML. Purement optionnel.

## Décision

- APPROVED

L'implémentation satisfait l'ensemble des critères d'acceptation
mécaniques du ticket (7 clés configurables, sept propagées à la création,
documentation présente), suit le plan approuvé, respecte les skills
code-quality / refactor-safety / security (pas d'identité opérateur en dur
dans le repo public), et documente clairement ses dépendances et
placeholders. Les divergences sur les valeurs par défaut provider sont
défendables, documentées, et surchargeables sans modification de code.

## Actions demandées

Aucune action bloquante. Suggestions non-bloquantes pour l'itération suivante :

1. Confirmer avec l'utilisateur que le choix "provider = placeholders,
   client = Lyra Network réel" est bien l'arbitrage voulu, ou committer les
   valeurs provider réelles si l'utilisateur juge le repo suffisamment privé.
2. Ouvrir un follow-up de réconciliation avec T009 (backend bootstrap) et
   T002/T004/T005 (modèle CRA) au moment de leur merge, pour remplacer
   `CraMonthlyReport` placeholder par l'entité canonique et fusionner les
   `pom.xml` / main classes.
3. Optionnel : ajouter `spring-boot-configuration-processor` en dépendance
   `optional` du `pom.xml` pour l'autocomplétion IDE des clés
   `cra.defaults.*`.
4. Faire tourner `mvn -pl backend test` sur CI dès que la pipeline
   supporte la compilation Java, pour confirmer que `CraCreationServiceTest`
   passe.

IMPLEMENTATION_APPROVED
