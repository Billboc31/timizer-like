# PR Review

## Résumé

Seconde revue de l'implémentation T026 (attempt-2). L'implémentation introduit
un namespace `cra.defaults` bindé par `@ConfigurationProperties` record,
un `CraCreationService` qui produit un `CraMonthlyReport` peuplé à partir
des defaults injectés, un test JUnit unitaire couvrant les sept champs,
un `application.yml` livrant les valeurs par défaut, et une page
`docs/configuration.md`. Le plan approuvé est respecté. Aucune régression
détectée par rapport à la revue attempt-1 déjà favorable.

## Vérifications effectuées

- Lecture du ticket T026 (`runs/T026/ticket.md`) et du plan approuvé
  (`runs/T026/plan.md`).
- Lecture de tous les fichiers backend et docs modifiés / créés
  (`git diff --stat ai-dev-factory/bootstrap-agent-layout...HEAD`).
- Recoupement des sept champs entre :
  - `CraDefaultsProperties` (record + records imbriqués Provider / Client / Contact),
  - `application.yml` (7 clés),
  - `CraMonthlyReport` (7 champs + `month`),
  - `CraCreationService.createForMonth` (7 accesseurs),
  - `CraCreationServiceTest` (7 assertions AssertJ),
  - `docs/configuration.md` (tableau à 7 lignes).
- Vérification qu'aucune valeur par défaut n'est en dur dans du source Java
  (`Grep "Provider Name|Provider Company|Provider Address"` → uniquement
  `application.yml`, `docs/configuration.md`, `CraCreationServiceTest`).
- Vérification du binding : `@ConfigurationPropertiesScan` sur
  `TimizerLikeApplication` — pas besoin de `@EnableConfigurationProperties`
  explicite.
- Contrôle du template `ai/templates/pr-review-template.md`.
- Contrôle de conformité aux skills workflow-discipline, code-quality,
  refactor-safety, security.

## Points validés

- **Namespace `cra.defaults`** — préfixe correct, structure imbriquée
  cohérente avec le plan
  (`backend/src/main/java/com/timizerlike/cra/config/CraDefaultsProperties.java:5`).
- **Enregistrement automatique du binding** —
  `@ConfigurationPropertiesScan` sur la main class
  (`backend/src/main/java/com/timizerlike/cra/TimizerLikeApplication.java:8`).
- **Zéro valeur par défaut en dur en Java** — les sept valeurs ne vivent
  que dans `application.yml`, conforme au plan
  (`backend/src/main/resources/application.yml:1`).
- **Wiring création CRA** — `CraCreationService.createForMonth(YearMonth)`
  propage les sept defaults sur le record retourné, sans branche partielle
  possible sur ce chemin
  (`backend/src/main/java/com/timizerlike/cra/service/CraCreationService.java:18`).
- **Test unitaire** — pur JUnit + AssertJ, sans contexte Spring, épingle
  les defaults à des valeurs connues via constructeur du record et vérifie
  les sept propagations + le mois
  (`backend/src/test/java/com/timizerlike/cra/service/CraCreationServiceTest.java:14`).
- **Documentation** — `docs/configuration.md` liste les sept clés, cite
  les valeurs livrées, décrit les deux mécanismes de surcharge Spring
  Boot standards (profil YAML `application-local.yml` et variables
  d'environnement `CRA_DEFAULTS_*`), avec exemples
  (`docs/configuration.md:44`).
- **Scope** — aucune couche non nécessaire modifiée. Pas de nouvel
  endpoint, pas de refactor CRA transversal, pas de génération PDF ni
  historique touchés. Conforme au plan (section Excluded).
- **Skills respectées** :
  - *code-quality* : records concis, noms explicites, injection par
    constructeur, aucune magie cachée.
  - *refactor-safety* : périmètre borné au ticket, pas de bascule
    silencieuse d'un comportement existant.
  - *security* : pas d'identité opérateur committée dans le repo public,
    surcharge via variables d'environnement documentée et recommandée.
  - *workflow-discipline* : plan approuvé avant implémentation, artefacts
    versionnés dans `runs/T026/`.

## Problèmes détectés

Aucun problème bloquant.

## Risques éventuels

- **Provider defaults génériques dans `application.yml`.** Le ticket dit
  "Defaults must match the personal Lyra Network CRA use case". Le client
  est bien Lyra Network (nom + adresse HQ publique), mais les trois champs
  provider (`name`, `company`, `address`) sont livrés en placeholders
  (`"Provider Name"`, etc.). Le coder documente ce choix comme arbitrage
  security-first (repo public → pas d'identité personnelle versionnée) et
  recommande la surcharge par variable d'environnement. Défendable au
  regard de la skill security ; à confirmer avec l'utilisateur si les
  valeurs provider réelles doivent être committées ou non.
- **Module backend bootstrappé dans ce ticket.** `backend/pom.xml` et
  `TimizerLikeApplication.java` sont ajoutés ici parce que T009 n'est pas
  encore mergé dans la worktree. Documenté en "Known limits" par le coder.
  Réconciliation à prévoir au merge de T009 (choisir un pom / une main
  class canonique).
- **Modèle de domaine placeholder.** `CraMonthlyReport` est un record
  minimal, pas l'entité JPA de T002/T004/T005. Le plan autorisait
  explicitement ce choix ("If [...] does not yet expose those seven
  fields, extend the persistence model [...]. If they already exist, only
  wire the defaults through"). À aligner au moment du merge avec
  T002/T004/T005.
- **Compilation et exécution du test non vérifiées localement** (pas de
  toolchain Java/Maven sur l'hôte). Le code est syntaxiquement simple et
  le test est indépendant du contexte Spring, mais confirmation reportée
  sur CI ou machine dev.
- **`spring-boot-configuration-processor` absent du `pom.xml`.** Pas
  bloquant (metadata IDE seulement), amélioration optionnelle.

## Décision

- APPROVED

L'implémentation satisfait l'ensemble des critères d'acceptation
mécaniques du ticket (7 clés configurables, 7 valeurs propagées à la
création, documentation présente), suit le plan approuvé, respecte les
skills applicables, et documente clairement ses dépendances et
placeholders. Aucune divergence bloquante par rapport à la revue
attempt-1 précédemment favorable.

## Actions demandées

Aucune action bloquante. Suggestions non-bloquantes pour l'itération
suivante :

1. Confirmer avec l'utilisateur l'arbitrage "provider = placeholders /
   client = Lyra Network réel" ou committer les valeurs provider réelles
   si le repo est jugé suffisamment privé.
2. Ouvrir un follow-up de réconciliation avec T009 (bootstrap backend) et
   T002/T004/T005 (modèle CRA canonique) au moment de leur merge.
3. Optionnel : ajouter `spring-boot-configuration-processor` comme
   dépendance `optional` du `pom.xml` pour l'autocomplétion IDE des clés
   `cra.defaults.*`.
4. Faire tourner `mvn -pl backend test` sur CI dès que la pipeline
   supporte la compilation Java.

IMPLEMENTATION_APPROVED
