# PR Review — T027 (attempt 2)

## Résumé

Deuxième halt consécutif du Coder sur un plan **non révisé** : `runs/T027/plan.md` est byte-identique à sa version initiale (unique commit `865a769`, aucune modification via un step planner entre les deux tentatives). Le Coder honore de nouveau, à raison, la clause d'auto-arrêt du plan (« *If the actual stack differs, the Coder must stop and re-open the plan rather than silently adapt.* »). Aucun fichier applicatif, config ou doc n'a été produit.

Le halt reste conforme, mais la situation n'a **pas** avancé : les critères d'acceptation du ticket T027 sont toujours à zéro. Pire, le workflow a routé la reprise sur le **Coder** au lieu du **Planner**, alors que la review d'attempt 1 explicitait clairement que la balle était chez le Planner. Sans re-planification, l'attempt 3 sera un troisième halt à l'identique. La décision reste `IMPLEMENTATION_FIX_REQUIRED` avec **escalade explicite** : la sortie du blocage ne peut plus se faire côté Coder.

## Vérifications effectuées

- Lecture du ticket `runs/T027/ticket.md` (AC inchangés) et du plan `runs/T027/plan.md` (toujours hypothèse Node/TS + `src/`, clause d'auto-arrêt présente).
- Vérification que `plan.md` n'a **pas** été rejoué : `git log --all --oneline -- runs/T027/plan.md` → un seul commit (`865a769 T027: planner checkpoint`). Aucun step planner entre la review-1 et le retry.
- Lecture du rapport de halt `runs/T027/implementation-output.md` (attempt 2) — factuel, sans mutation d'état ni de mémoire.
- Inspection de l'historique récent : `19ba7d1` (coder halt 1) → `444f9b6` (review 1 → FIX_REQUIRED, demande retour Planner) → `6707204` (coder halt 2). Aucun commit `planner` intercalé.
- `git status` : uniquement `daemon.lock` et `runtime.log` modifiés + `prompts/review-attempt-2.md` (artefacts workflow, aucun code applicatif).
- `git ls-files` : toujours 36 fichiers de scaffolding AI Dev Factory, aucun `backend/`, `frontend/`, `pom.xml`, `package.json`, `src/` sur cette branche.
- `git branch -a` : `ticket/T009-bootstrap-spring-boot-backend` et `ticket/T010-bootstrap-react-frontend` toujours non mergés dans `main`. La situation de dépendance décrite dans la review-1 est inchangée.
- Vérification que le Coder n'a muté ni `state.json` ni `workflow-status.md` par lui-même (respect de la séparation des rôles).
- Aucune donnée sensible / secret ajouté (rien n'a été ajouté).

## Points validés

- Auto-arrêt à nouveau honoré : le Coder ne traduit pas silencieusement le plan Node/TS en Java. Respect strict de `refactor-safety` et de la clause du plan.
- Respect de `workflow-discipline` : pas de mutation mémoire, pas de bypass, artefacts workflow versionnés.
- Rapport de halt attempt-2 concis, factuel, adossé aux vérifications (`git log` sur `plan.md` byte-identique, référence explicite à la conclusion de la review-1).
- Escalade explicite formulée par le Coder (« *Two consecutive halts on the same unrevised plan* ») — bon signalement, cohérent avec ce que la review-1 avait demandé.

## Problèmes détectés

### Bloquants (inchangés depuis attempt 1, non-adressés)

Les 5 points bloquants énoncés dans `runs/T027/reviews/review-attempt-1.md` restent **strictement identiques** puisque le plan n'a pas été rejoué :

1. **Hypothèse de stack incorrecte** dans `plan.md` (Node/TS + `src/`) — la stack cible est Spring Boot Java (T009) + React (T010), et T016 place la génération PDF côté backend.
2. **Dépendance à T009 non déclarée** dans le plan.
3. **Modèle de configuration inadapté à Spring** (`PROVIDER_SIGNATURE_PATH` env-only au lieu de `@ConfigurationProperties("timizer.provider-signature")`).
4. **Layout de fichiers Maven manquant** (`src/assets/__fixtures__` n'existe pas ; fixtures à mettre sous `backend/src/test/resources/signature/`).
5. **Aucun critère d'acceptation satisfait** — 0 config, 0 loader, 0 doc, 0 test.

### Bloquant nouveau — routage workflow

6. **Boucle de routage cassée.** `workflow-status.md` montre la transition `IMPLEMENTATION_FIX_REQUIRED → step: coder → IMPLEMENTATION_REVIEW_NEEDED` alors que la review-1 exigeait explicitement un **retour Planner**. Sans intervention sur ce routage, chaque retry Coder produira le même halt. Le fix doit **imposer** un step planner avant tout nouveau step coder.

### Non bloquants

- Le principe *single access point* du plan à conserver côté Java (déjà noté attempt 1).
- Le rappel security (signature jamais committée ni loggée, chemin résolu potentiellement visible dans les messages d'erreur — choix acceptable, à documenter) reste à intégrer au replan.
- Le piste "docs-only" pour permettre à T027 de livrer quelque chose avant T009 doit être tranchée **explicitement** dans le nouveau plan (Planner ou reviewer humain), et pas à la volée par le Coder.

## Risques éventuels

- **Boucle infinie de halts** si le routage continue de rappeler le Coder sans planner intercalé. Deux halts identiques constatés ; le troisième est mécaniquement garanti.
- **Dérive de scope** si un opérateur, lassé par la boucle, autorise le Coder à traduire mentalement Node → Java sans replan — ce serait une violation directe de la clause d'auto-arrêt et de `refactor-safety`, et livrerait du code Java potentiellement en conflit avec T009.
- **Conflits de merge** sur `backend/pom.xml` / package layout à venir si un nouveau plan crée du code Java **avant** que T009 soit mergé (raison pour laquelle l'option docs-only doit être considérée).
- **Aucun risque de sécurité immédiat** : rien n'a été ajouté, aucun secret n'est exposé.

## Décision

- REQUEST_CHANGES

Sortie de la boucle **impérative** : ce retry Coder ne pouvait rien produire d'utile et le prochain ne le pourra pas non plus tant que `plan.md` reste identique.

## Actions demandées

### Priorité 1 — débloquer le routage

- Forcer une reprise **Planner** (pas Coder) après ce `IMPLEMENTATION_FIX_REQUIRED`. Si le harness re-route automatiquement vers Coder, une intervention humaine est nécessaire pour rejouer un step planner sur `runs/T027/plan.md`.
- Tant que `runs/T027/plan.md` reste byte-identique à `865a769`, tout retry Coder doit être considéré comme non-productif et re-refusé sans nouvelle enquête.

### Priorité 2 — re-planification (à destination du Planner)

Les 8 actions listées dans la section « Actions demandées » de `runs/T027/reviews/review-attempt-1.md` restent **intégralement valides** et non-adressées. Résumé opérationnel :

1. Remplacer l'hypothèse Node/TS par **Spring Boot Java** ; loader sous `backend/`.
2. Déclarer la dépendance à **T009** — ou trancher explicitement pour un **scope docs-only** si T027 doit avancer avant T009 (docs, `.gitignore`, `.gitkeep`, conventions de clé de config uniquement).
3. Ré-écrire le layout Maven : `ProviderSignatureProperties.java` (`@ConfigurationProperties("timizer.provider-signature")`), `ProviderSignatureLoader.java`, `ProviderSignatureAssetException.java`, clé `timizer.provider-signature.path` dans `application.properties`, tests JUnit + fixtures sous `backend/src/test/resources/signature/`.
4. Conserver "fail clearly avec exception typée portant `resolvedPath` et `reason`".
5. Conserver *single access point* (seul `ProviderSignatureLoader` lit le fichier).
6. Documenter `docs/provider-signature.md` : chemin par défaut, override propriété / env (`TIMIZER_PROVIDER_SIGNATURE_PATH`), formats (PNG/JPEG), comportement d'absence, non-commit du binaire.
7. Vérifier / prévoir `backend/.gitignore` pour `assets/provider-signature.*`.
8. Rappeler dans le plan que la mémoire projet n'est mise à jour qu'après validation implémentation.

Rien à corriger côté Coder : sa décision d'arrêt reste conforme. Le blocage est côté routage workflow **et** côté Planner.

IMPLEMENTATION_FIX_REQUIRED
