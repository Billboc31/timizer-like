# PR Review — T027 (attempt 1)

## Résumé

Le Coder a **halté** l'implémentation avant tout changement, en invoquant la clause d'auto-arrêt du plan : *"If the actual stack differs, the Coder must stop and re-open the plan rather than silently adapt."* L'analyse du Coder est **correcte** — la stack hypothétique (Node/TS + `src/`) ne correspond pas à la stack réelle du projet (Spring Boot backend Java + React frontend). Le halt est le bon comportement au regard du plan actuel.

Cependant, un halt ne satisfait aucun critère d'acceptation du ticket T027 (aucun code, aucune config, aucune doc). Le blocage se situe au niveau du **plan**, qui doit être ré-instruit avec la stack correcte et une dépendance explicite à T009. La décision est donc `IMPLEMENTATION_FIX_REQUIRED`, l'action attendue étant un **retour au Planner**, pas une reprise du Coder sur le plan actuel.

## Vérifications effectuées

- Lecture du ticket `runs/T027/ticket.md` et des critères d'acceptation.
- Lecture du plan `runs/T027/plan.md` (hypothèse Node/TS explicitement posée, clause d'auto-arrêt présente).
- Lecture du rapport de halt `runs/T027/implementation-output.md`.
- Vérification de l'arbre de la worktree : seule la scaffolding AI Dev Factory est présente sur la branche T027, aucun code applicatif.
- Vérification via `git branch -a` : `ticket/T009-bootstrap-spring-boot-backend` et `ticket/T010-bootstrap-react-frontend` existent mais ne sont pas mergés dans `main`. Aucun `pom.xml` / `build.gradle` / `package.json` n'existe sur `main`.
- Inspection de `ticket/T009` (Spring Boot / Java sous `backend/`) et du ticket T016 (générateur PDF placé côté backend) — confirme que le loader de signature appartient à la stack Java, pas Node/TS.
- Confirmation qu'aucun fichier n'a été modifié par le Coder ; ni `state.json` ni `workflow-status.md` n'ont été mutés (respect de la séparation des rôles).

## Points validés

- Respect du contrat du plan : la clause d'auto-arrêt en cas de stack falsifiée a été honorée à la lettre.
- Respect de `refactor-safety` : aucun refactor implicite, aucune tentative d'adaptation silencieuse vers Java.
- Respect de `workflow-discipline` : aucune mutation mémoire ni d'état workflow, aucun bypass.
- Rapport de halt clair, factuel, avec vérifications et proposition de correctif structurée.
- Choix "fail clearly avec exception typée" conservé — aligné avec le ticket.

## Problèmes détectés

### Bloquants (au niveau du plan)

1. **Hypothèse de stack incorrecte.** Le plan cible du TS sous `src/` ; le backend cible est Java/Spring Boot (T009), et T016 place la génération PDF côté backend.
2. **Dépendance manquante à T009.** Aucune déclaration que T027 dépend d'un backend bootstrappé ; sur `main` aucun `backend/` n'existe.
3. **Modèle de configuration inadapté à Spring.** `PROVIDER_SIGNATURE_PATH` env-only ignore `@ConfigurationProperties` ; un `timizer.provider-signature.path` est plus idiomatique.
4. **Layout de fichiers erroné.** Pas de `src/assets/__fixtures__` dans Maven ; fixtures sous `backend/src/test/resources/...`.
5. **Aucun critère d'acceptation satisfait.** L'implémentation est vide.

### Non bloquants

- Principe *single access point* du plan à conserver côté Java.
- Refus explicite de "silent fallback" en MVP conforme au ticket.
- Piste "docs-only" possible si T027 doit avancer avant T009 — à trancher explicitement.

## Risques éventuels

- Dérive de scope si le Coder retente sans replan (traduction Node→Java à la volée).
- Conflits de merge sur `backend/pom.xml` si un nouveau plan crée du code Java avant que T009 soit mergé.
- Rappel security à intégrer au replan : signature jamais committée ni loggée ; chemin résolu peut apparaître dans les messages d'erreur (choix explicite acceptable, à documenter).

## Décision

- REQUEST_CHANGES

## Actions demandées

Retour au **Planner** avec :
1. Remplacer l'hypothèse Node/TS par **Spring Boot Java** ; loader dans `backend/`.
2. Déclarer explicitement la dépendance à **T009**, sinon réduire T027 à un scope **docs-only** (docs, `.gitignore`, `.gitkeep`, conventions).
3. Ré-écrire la liste de fichiers en layout Maven : `ProviderSignatureProperties.java` (`@ConfigurationProperties("timizer.provider-signature")`), `ProviderSignatureLoader.java`, `ProviderSignatureAssetException.java`, clé dans `application.properties`, tests JUnit + fixtures sous `backend/src/test/resources/signature/`.
4. Conserver "fail clearly avec exception typée portant `resolvedPath` et `reason`".
5. Conserver *single access point*.
6. Documenter `docs/provider-signature.md` : chemin par défaut, override propriété / env, formats, comportement d'absence, non-commit du binaire.
7. Vérifier `backend/.gitignore` pour `assets/provider-signature.*`.
8. Rappeler dans le plan que la mémoire n'est mise à jour qu'après validation de l'implémentation.

Rien à corriger côté Coder : sa décision d'arrêt est conforme. La balle est chez le Planner.

Review écrite dans `runs/T027/reviews/review-attempt-1.md`.

IMPLEMENTATION_FIX_REQUIRED
