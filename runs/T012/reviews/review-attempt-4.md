# PR Review — T012 (Create CRA day update API), attempt 4

## Résumé

Cinquième tentative du Coder, quatrième review. Situation strictement
identique aux trois reviews précédentes : aucun code applicatif n'a été
produit sur `ticket/T012-create-cra-day-update-api`, aucun critère
d'acceptation du ticket n'est vérifiable, et le blocage racine — les
six branches prérequises (T009, T002, T003, T004, T005, T007) toujours
non mergées dans la base de T012 — n'a toujours pas été levé par
l'opérateur du workflow.

Le Coder (attempt 4, `runs/T012/implementation-output.md`) documente
l'escalade `IMPLEMENTATION_BLOCKED_UPSTREAM_PERSISTENT` et refuse
explicitement d'étendre le scope au bootstrap du module `backend/` et
aux cinq tickets upstream. Ce refus est conforme au plan
(« do not silently expand scope to bootstrap the missing pieces beyond
a strict minimum needed for this endpoint »), à `workflow-discipline`
et à `refactor-safety`.

## Vérifications effectuées

- `ls` racine du worktree : `ai/`, `docs/`, `prompts/`, `runs/`,
  `tickets/`. Aucun répertoire `backend/` ni `frontend/`.
- `git log --oneline -20` : depuis le bootstrap
  (`0031ccd chore: add AI Dev Factory agent workspace`), uniquement des
  commits `chore(T012/workflow)`, `chore(T012): pre-sync auto-commit`,
  `docs(T012/workflow): planner` et `T012: planner|bootstrap checkpoint`.
  Aucun commit applicatif.
- `git diff 4128616..HEAD --stat` : 23 fichiers modifiés, tous
  strictement sous `runs/T012/**` (2 987 insertions d'artefacts de
  workflow, 2 suppressions dans `state.json`). Zéro fichier Java (prod
  ou test) n'a jamais été introduit sur cette branche.
- `git merge-base --is-ancestor` sur les six prérequis listés dans le
  plan (`Assumptions on starting state`) :
  - `ticket/T009-bootstrap-spring-boot-backend` → NOT MERGED
  - `ticket/T002-create-cra-monthly-report-entity` → NOT MERGED
  - `ticket/T003-create-cra-day-entry-entity` → NOT MERGED
  - `ticket/T004-create-cra-repository` → NOT MERGED
  - `ticket/T005-create-cra-dtos` → NOT MERGED
  - `ticket/T007-create-cra-creation-api` → NOT MERGED
- Le plan (`runs/T012/plan.md`) énumère explicitement les hypothèses de
  départ (module Spring Boot, entités `MonthlyCraReport` /
  `CraDayEntry`, enum `ValidationStatus`, DTOs sous
  `com.timizerlike.backend.cra.dto`, `MonthlyCraReportRepository`),
  toutes fausses en l'état.
- L'`implementation-output.md` attempt 4 (`Summary — attempt 4`) est
  cohérent avec les observations : aucun changement applicatif
  revendiqué, escalade correctement labellisée
  `IMPLEMENTATION_BLOCKED_UPSTREAM_PERSISTENT`, actions opérateur
  détaillées.

## Points validés

- Le Coder n'a dérivé sur aucun aspect : aucun bootstrap silencieux,
  aucune réimplémentation opportuniste des entités/DTOs/repositories
  prérequis, aucun changement hors `runs/T012/**`.
- Aucun refactor transversal, aucune régression, aucune fuite de
  secret, aucune opération destructive, aucune dépendance introduite.
- L'escalade `IMPLEMENTATION_BLOCKED_UPSTREAM_PERSISTENT` identifie
  correctement la nature persistante du blocage : la boucle
  Coder → review → Coder ne peut rien produire tant que l'opérateur
  n'agit pas sur la base de la branche. Diagnostic et formulation
  correctes.
- Discipline de workflow intacte : plan / implementation / review
  restent séparés, la mémoire projet n'a pas été mise à jour
  prématurément, le lifecycle du ticket n'est pas contourné.

## Problèmes détectés

Bloquants (empêchent l'approbation) :

1. **Aucun critère d'acceptation du ticket n'est satisfait.**
   L'endpoint `PATCH /api/cras/{craId}/days/{date}` n'existe pas,
   aucun test n'a été ajouté, `mvn test` ne peut pas être invoqué
   (pas de module Maven). Le ticket est objectivement non livrable —
   indépendamment de la bonne conduite du Coder.
2. **Le blocage upstream n'a toujours pas été levé après trois
   reviews consécutives.** Les reviews-1, -2 et -3 demandaient
   explicitement à l'opérateur de merger/rebaser
   T009 → T002 → T003 → T004 → T005 → T007 dans la base de T012 avant
   de relancer le Coder. Aucun de ces merges n'a eu lieu ; le harness
   a relancé le Coder une quatrième fois sans changement de base, ce
   qui produit mécaniquement le même artefact vide.

Non bloquants :

- Divergence préexistante des packages (`com.timizer.backend.cra` vs.
  `com.timizerlike.backend.cra.*`). Hors scope de T012, ne pas
  « corriger » opportunément à la reprise.
- Le harness continue de relancer le Coder après un
  `IMPLEMENTATION_BLOCKED_UPSTREAM_PERSISTENT` : lacune du harness
  plutôt que du Coder ou de la review, mais elle amplifie le
  problème 1 à chaque cycle stérile.

## Risques éventuels

- **Boucle stérile prolongée.** Une cinquième tentative du Coder, sans
  levée du blocage upstream, produira strictement le même artefact et
  consommera du budget sans progression. Priorité absolue à l'action
  opérateur avant tout nouveau cycle. Le coût cumulé de quatre cycles
  Coder + quatre reviews sans progrès est déjà significatif.
- **Rebase après merge des prérequis.** Si l'opérateur merge les six
  prérequis dans une base commune sans rebaser ensuite
  `ticket/T012-create-cra-day-update-api` par-dessus, la branche T012
  ne verra pas les changements. Le rebase (ou merge de la base) est
  indispensable après l'étape opérateur.
- **Divergence d'hypothèses à la reprise.** Les prérequis mergés
  pourraient légèrement diverger des noms de packages, du contenu de
  `ValidationStatus`, ou de la signature des entités attendus par le
  plan. Le Coder doit revérifier chaque hypothèse (étape 1 du plan) et
  signaler tout écart plutôt que d'adapter silencieusement ; une mise
  à jour ciblée du plan peut être nécessaire avant la reprise.
- **Recouvrement de scope si re-plan.** L'alternative « élargir T012
  pour inclure le bootstrap » recouvrerait cinq à six tickets existants
  et provoquerait des conflits de merge quasi certains lors de leur
  intégration ultérieure. Non recommandée sans décision produit
  explicite.

## Décision

REQUEST_CHANGES.

Motivation : un ticket dont aucun critère d'acceptation n'est
vérifiable ne peut pas être approuvé, même quand le blocage a une
cause légitime en amont et que le Coder s'est comporté correctement
pendant quatre attempts consécutifs. Le fix requis n'est pas au niveau
du Coder mais au niveau de l'opérateur du workflow ; approuver ici
masquerait un ticket non livrable et publierait un statut
« implementation approved » sans implémentation.

## Actions demandées

Pour l'opérateur du workflow (bloquant — hors périmètre Coder, en
priorité absolue) :

1. **Arrêter la boucle Coder sur T012.** Toute nouvelle relance sans
   changement de base reproduira exactement le même
   `IMPLEMENTATION_BLOCKED_UPSTREAM_PERSISTENT` et consommera du budget
   sans progrès. La responsabilité de sortir du cycle n'appartient
   plus au Coder ni au Reviewer.
2. Choisir la stratégie de remédiation :
   - **Option recommandée** — merger/rebaser dans la base de T012,
     dans l'ordre de dépendance :
     T009 → T002 → T003 → T004 → T005 → T007. Puis rebase de
     `ticket/T012-create-cra-day-update-api` sur la nouvelle base et
     relance du Coder sur le plan actuel.
   - **Option non recommandée** — renvoyer T012 au Planner pour
     élargir explicitement le scope au bootstrap (dérive fonctionnelle,
     recouvrement de tickets existants, décision produit nécessaire,
     à documenter dans le ticket et le plan).
3. Après merge des prérequis, vérifier que les noms de packages
   (`com.timizer.backend.cra` vs `com.timizerlike.backend.cra.*`),
   la présence de `MonthlyCraReportRepository`, et le contenu de
   `ValidationStatus` correspondent aux hypothèses du plan ; si
   divergence, mettre à jour le plan avant de relancer le Coder.
4. Si le harness redémarre automatiquement la boucle malgré un
   `IMPLEMENTATION_FIX_REQUIRED` avec cause `UPSTREAM_PERSISTENT`,
   corriger la configuration du harness (ou introduire une condition
   de garde) pour éviter la boucle stérile.

Pour le Coder à la reprise (une fois les prérequis en place) :

- Reprendre les étapes 1–7 du plan telles quelles.
- Revérifier explicitement chacune des hypothèses de départ avant de
  toucher au code ; signaler tout écart plutôt que d'adapter
  silencieusement.
- Ne pas « corriger » la divergence préexistante
  `com.timizer.backend.cra` vs `com.timizerlike.backend.cra.dto` :
  hors scope de T012.

IMPLEMENTATION_FIX_REQUIRED
