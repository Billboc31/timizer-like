# PR Review — T012 (Create CRA day update API), attempt 2

## Résumé

Troisième tentative du Coder, deuxième review. Aucun changement de code
applicatif n'a été produit depuis la review précédente : le diff
`0031ccd..HEAD` reste exclusivement sous `runs/T012/**`, et le diff
`292c35c..HEAD` (depuis le commit de review précédente) ne contient que des
artefacts de workflow (`fixes/context-*.md`, `implementation-output.md`,
`prompts/coder-attempt-3.md`, `state.json`, `workflow-status.md`).

Le blocage identifié à l'attempt 1 n'a pas été levé par l'opérateur : les
prérequis exigés par le plan (module Spring Boot `backend/`, entités,
DTOs, `MonthlyCraReportRepository`, `ValidationStatus`) sont toujours
absents de la base de la branche `ticket/T012-create-cra-day-update-api`.

Le Coder a documenté cette situation dans `implementation-output.md`
(escalade `IMPLEMENTATION_BLOCKED_UPSTREAM`) et n'a pas élargi le scope
pour bootstrap le module, ce qui est conforme au plan et aux skills
`workflow-discipline` / `refactor-safety` du rôle Coder.

## Vérifications effectuées

- `ls` racine du worktree : `ai/`, `docs/`, `prompts/`, `runs/`,
  `tickets/` — toujours pas de `backend/` ni `frontend/`.
- `git diff 0031ccd..HEAD --stat` : uniquement `runs/T012/**` (17 fichiers,
  1968 insertions, aucun fichier applicatif).
- `git diff 292c35c..HEAD --stat` (delta depuis la précédente review) :
  aucun fichier hors `runs/T012/**`.
- `git log --oneline -30` : uniquement des commits `chore(T012/workflow)`
  et `chore(T012): pre-sync auto-commit` depuis le bootstrap.
- `git merge-base --is-ancestor` vérifié sur les six branches prérequises
  attendues par le plan :
  - `ticket/T009-bootstrap-spring-boot-backend` → NOT MERGED
  - `ticket/T007-create-cra-creation-api` → NOT MERGED
  - `ticket/T002-create-cra-monthly-report-entity` → NOT MERGED
  - `ticket/T003-create-cra-day-entry-entity` → NOT MERGED
  - `ticket/T004-create-cra-repository` → NOT MERGED
  - `ticket/T005-create-cra-dtos` → NOT MERGED
- Hypothèses de départ listées dans `plan.md` (« Assumptions on starting
  state ») : toutes fausses, comme à l'attempt 1.
- Instruction explicite du plan en cas d'hypothèses fausses : « the Coder
  must stop and flag it before making changes; do not silently expand
  scope to bootstrap the missing pieces ». Le Coder l'a respectée.

## Points validés

- Discipline de workflow tenue : le Coder n'a pas dérivé, n'a pas
  bootstrapé six tickets en un, n'a pas silencieusement modifié
  l'architecture. `IMPLEMENTATION_BLOCKED_UPSTREAM` est justifié et
  documenté avec précision (implementation-output.md attempt 3).
- Aucune régression, aucun refactor transversal, aucune fuite de secret,
  aucune opération destructive.
- La cause racine reste correctement identifiée et attribuée à l'opérateur.

## Problèmes détectés

Bloquants (empêchent l'approbation) :

1. **Aucun critère d'acceptation du ticket n'est satisfait.** L'endpoint
   `PATCH /api/cras/{craId}/days/{date}` n'existe pas, aucun test n'a été
   ajouté, `mvn test` ne peut pas être exécuté (pas de module Maven).
   Le ticket est en l'état non livrable.
2. **Le blocage upstream identifié à l'attempt 1 n'a pas été levé.** La
   review-attempt-1 demandait explicitement à l'opérateur de merger/rebaser
   T009 → T002 → T003 → T004 → T005 → T007 dans la base de T012 avant
   de relancer le Coder. Cette action n'a pas eu lieu, et relancer une
   troisième fois le Coder sans lever le blocage produit mécaniquement le
   même résultat.

Non bloquants :

- Le plan mentionne toujours deux hiérarchies de packages divergentes
  (`com.timizer.backend.cra` pour les entités et
  `com.timizerlike.backend.cra.dto` / `com.timizerlike.cra.service` pour
  DTOs et services). Préexistant, hors scope, ne doit pas être « corrigé »
  opportunément à la reprise.

## Risques éventuels

- Relancer le Coder une quatrième fois sans intervention opérateur produira
  le même artefact : c'est une boucle stérile qui consomme des tokens sans
  progression. Priorité à l'action opérateur avant tout nouveau cycle.
- Si l'opérateur choisit de merger les prérequis sans rebase de T012, les
  packages, statuts (`ValidationStatus`) et signatures d'entités
  supposés par le plan pourraient légèrement diverger de la réalité mergée
  ; le Coder devra reverifier hypothèse par hypothèse à la reprise, comme
  le plan l'exige déjà à l'étape 1.
- Un re-plan avec bootstrap élargi (option non recommandée) ferait
  recouvrir T012 avec cinq à six tickets existants et provoquerait des
  conflits de merge quasi certains lors des intégrations ultérieures.

## Décision

REQUEST_CHANGES.

Motivation : un ticket dont aucun critère d'acceptation n'est vérifié ne
peut pas être approuvé, même quand le blocage a une cause légitime en
amont et que le Coder s'est comporté correctement. Le fix requis n'est
plus au niveau du Coder mais au niveau de l'opérateur du workflow.

## Actions demandées

Pour l'opérateur (bloquant — hors périmètre Coder) :

1. **Ne pas relancer le Coder tant que les prérequis ne sont pas mergés.**
   Toute nouvelle tentative sans changement de la base produira
   mécaniquement le même `IMPLEMENTATION_BLOCKED_UPSTREAM`.
2. Choisir la stratégie de remédiation :
   - **Option recommandée** : merger/rebaser dans la base de T012, dans
     l'ordre de dépendance : T009 → T002 → T003 → T004 → T005 → T007.
     Ensuite rebase de `ticket/T012-create-cra-day-update-api` sur la
     nouvelle base et relance du Coder sur le plan actuel.
   - **Option non recommandée** : renvoyer T012 au Planner pour élargir
     explicitement le scope au bootstrap (dérive fonctionnelle,
     recouvrement de tickets existants — nécessite une décision produit
     explicite documentée dans le ticket et le plan).
3. Après merge des prérequis, vérifier que les noms de packages, la
   présence de `MonthlyCraReportRepository`, et l'énum `ValidationStatus`
   correspondent aux hypothèses du plan ; si divergence, mettre à jour le
   plan avant de relancer le Coder.

Pour le Coder à la reprise (une fois les prérequis en place) :

- Reprendre les étapes 1–7 du plan telles quelles.
- Vérifier explicitement chacune des hypothèses de départ avant de
  toucher au code ; signaler tout écart plutôt que d'adapter silencieusement.
- Ne pas « corriger » la divergence préexistante `com.timizer.backend.cra`
  vs `com.timizerlike.backend.cra.dto` : hors scope.

IMPLEMENTATION_FIX_REQUIRED
