# PR Review — T012 (Create CRA day update API), attempt 3

## Résumé

Quatrième tentative du Coder, troisième review. Situation strictement
identique aux deux reviews précédentes : aucun code applicatif n'a été
produit sur la branche `ticket/T012-create-cra-day-update-api`, aucun
critère d'acceptation n'est satisfait, et le blocage racine — les six
branches prérequises non mergées dans la base de T012 — n'a toujours
pas été levé par l'opérateur du workflow.

Le Coder (attempt 4, `runs/T012/implementation-output.md`) escalade
`IMPLEMENTATION_BLOCKED_UPSTREAM_PERSISTENT` en refusant explicitement
d'élargir le scope au bootstrap du module `backend/` et de cinq entités
/ DTOs. Ce refus est conforme au plan (« do not silently expand scope
to bootstrap the missing pieces beyond a strict minimum needed for this
endpoint ») et aux skills `workflow-discipline` / `refactor-safety`.

## Vérifications effectuées

- `ls` racine du worktree : `ai/`, `docs/`, `prompts/`, `runs/`,
  `tickets/`. Aucun répertoire `backend/` ni `frontend/`.
- `git log --oneline -15` : depuis le bootstrap, uniquement des commits
  `chore(T012/workflow)`, `chore(T012): pre-sync auto-commit`,
  `docs(T012/workflow): planner`. Aucun commit applicatif.
- `git diff 0031ccd..HEAD --stat` : 22 fichiers, tous strictement sous
  `runs/T012/**` (2650 insertions d'artefacts de workflow). Zéro fichier
  de production ou de test Java n'a jamais été introduit sur cette branche.
- `git merge-base --is-ancestor` sur les six prérequis listés dans le
  plan (`Assumptions on starting state`) :
  - `ticket/T009-bootstrap-spring-boot-backend` → NOT MERGED
  - `ticket/T002-create-cra-monthly-report-entity` → NOT MERGED
  - `ticket/T003-create-cra-day-entry-entity` → NOT MERGED
  - `ticket/T004-create-cra-repository` → NOT MERGED
  - `ticket/T005-create-cra-dtos` → NOT MERGED
  - `ticket/T007-create-cra-creation-api` → NOT MERGED
- Le plan (`runs/T012/plan.md`) énumère explicitement les hypothèses de
  départ (module Spring Boot, entités `MonthlyCraReport` / `CraDayEntry`,
  enum `ValidationStatus`, DTOs, `MonthlyCraReportRepository`), toutes
  fausses en l'état.
- L'`implementation-output.md` attempt 4 est cohérent avec les
  observations : il ne prétend aucun changement applicatif et documente
  correctement l'escalade.

## Points validés

- Le Coder n'a pas dérivé : aucun bootstrap silencieux, aucune
  réimplémentation opportuniste des entités/DTOs prérequis, aucun
  changement hors `runs/T012/**`.
- Aucun refactor transversal, aucune régression, aucune fuite de
  secret, aucune opération destructive.
- L'escalade `IMPLEMENTATION_BLOCKED_UPSTREAM_PERSISTENT` (attempt 4)
  identifie précisément la nature persistante du blocage : la boucle
  Coder → review → Coder ne produit rien tant que l'opérateur ne rebase
  ni ne merge les prérequis. Diagnostic correct, formulation correcte.
- La discipline de workflow est intacte : plan / implementation /
  review restent séparés, la mémoire projet n'a pas été mise à jour
  prématurément, le lifecycle du ticket n'est pas contourné.

## Problèmes détectés

Bloquants (empêchent l'approbation) :

1. **Aucun critère d'acceptation du ticket n'est satisfait.** L'endpoint
   `PATCH /api/cras/{craId}/days/{date}` n'existe pas, aucun test n'a
   été ajouté, `mvn test` ne peut pas être invoqué (pas de module
   Maven). Le ticket est non livrable en l'état — c'est un fait objectif
   indépendant du comportement du Coder.
2. **Le blocage upstream, identifié aux attempts 1 et 2, n'a toujours
   pas été levé.** Les reviews-1 et -2 demandaient explicitement à
   l'opérateur de merger/rebaser T009 → T002 → T003 → T004 → T005 → T007
   dans la base de T012 avant de relancer le Coder. Aucun de ces merges
   n'a eu lieu, et le harness a relancé le Coder une troisième puis une
   quatrième fois sans changement de base — ce qui produit
   mécaniquement le même artefact.

Non bloquants :

- Divergence de packages préexistante dans le plan (`com.timizer.backend.cra`
  pour les entités et `com.timizerlike.backend.cra.dto` /
  `com.timizerlike.cra.service` pour DTOs/services). Hors scope de T012,
  ne pas « corriger » opportunément à la reprise.
- Le plan mentionne « if any assumption above is false at ticket start,
  the Coder must stop and flag it ». L'instruction est correctement
  respectée, mais rien dans le workflow n'interrompt la boucle de retry
  automatique tant que l'opérateur ne l'arrête pas — c'est une lacune
  du harness plus qu'un problème du Coder ou de la review.

## Risques éventuels

- **Boucle stérile.** Une cinquième tentative du Coder, sans levée du
  blocage upstream, produira strictement le même artefact et consommera
  du budget sans progression. Priorité absolue à l'action opérateur
  avant tout nouveau cycle.
- **Rebase après merge des prérequis.** Si l'opérateur merge les six
  prérequis dans la base commune sans rebaser ensuite
  `ticket/T012-create-cra-day-update-api` par-dessus, la branche T012
  ne verra pas les changements. Le rebase (ou merge de la base) est
  indispensable après l'étape opérateur.
- **Divergence d'hypothèses à la reprise.** Les prérequis mergés
  pourraient légèrement diverger des noms de packages, du contenu de
  `ValidationStatus`, ou de la signature des entités attendus par le
  plan. Le Coder doit revérifier chaque hypothèse (étape 1 du plan) et
  signaler tout écart plutôt que d'adapter silencieusement ; le plan
  peut alors nécessiter une mise à jour ciblée avant la reprise.
- **Recouvrement de scope si re-plan.** L'alternative « élargir T012
  pour inclure le bootstrap » recouvrerait cinq à six tickets existants
  et provoquerait des conflits de merge quasi certains lors de leur
  intégration ultérieure. Non recommandée sans décision produit
  explicite.

## Décision

REQUEST_CHANGES.

Motivation : un ticket dont aucun critère d'acceptation n'est vérifié
ne peut pas être approuvé, même quand le blocage a une cause légitime
en amont et que le Coder s'est comporté correctement pendant trois
attempts consécutifs. Le fix requis n'est pas au niveau du Coder mais
au niveau de l'opérateur du workflow ; approuver ici masquerait un
ticket non livrable.

## Actions demandées

Pour l'opérateur du workflow (bloquant — hors périmètre Coder, en
priorité absolue) :

1. **Arrêter la boucle Coder sur T012.** Toute nouvelle relance sans
   changement de base reproduira le même `IMPLEMENTATION_BLOCKED_UPSTREAM`
   et consommera du budget sans progrès. La responsabilité de sortir
   du cycle n'appartient plus au Coder.
2. Choisir la stratégie de remédiation :
   - **Option recommandée** — merger/rebaser dans la base de T012, dans
     l'ordre de dépendance : T009 → T002 → T003 → T004 → T005 → T007.
     Puis rebase de `ticket/T012-create-cra-day-update-api` sur la
     nouvelle base et relance du Coder sur le plan actuel.
   - **Option non recommandée** — renvoyer T012 au Planner pour élargir
     explicitement le scope au bootstrap (dérive fonctionnelle,
     recouvrement de tickets existants, décision produit nécessaire,
     à documenter dans le ticket et le plan).
3. Après merge des prérequis, vérifier que les noms de packages
   (`com.timizer.backend.cra` vs `com.timizerlike.backend.cra.*`),
   la présence de `MonthlyCraReportRepository`, et le contenu de
   `ValidationStatus` correspondent aux hypothèses du plan ; si
   divergence, mettre à jour le plan avant de relancer le Coder.

Pour le Coder à la reprise (une fois les prérequis en place) :

- Reprendre les étapes 1–7 du plan telles quelles.
- Revérifier explicitement chacune des hypothèses de départ avant de
  toucher au code ; signaler tout écart plutôt que d'adapter
  silencieusement.
- Ne pas « corriger » la divergence préexistante `com.timizer.backend.cra`
  vs `com.timizerlike.backend.cra.dto` — hors scope de T012.

IMPLEMENTATION_FIX_REQUIRED
