# PR Review — T012 (Create CRA day update API), attempt 1

## Résumé

Le Coder n'a produit aucun changement de code. Le seul artefact modifié est
`runs/T012/implementation-output.md`, dans lequel le Coder documente un
blocage : les prérequis du plan (module `backend/` Spring Boot, entités
`MonthlyCraReport` / `CraDayEntry`, DTOs, `MonthlyCraReportRepository`,
`ValidationStatus`, etc.) n'existent pas sur la base de T012. Les branches
prérequises (T009, T002, T003, T004, T005, T007) ne sont pas mergées dans la
base de la branche `ticket/T012-create-cra-day-update-api`.

Ce blocage est réel : la racine du worktree ne contient aucun répertoire
`backend/`. L'endpoint demandé par le ticket n'a donc pas été implémenté et
aucun critère d'acceptation n'est vérifiable.

## Vérifications effectuées

- Diff `0031ccd..HEAD` : uniquement des fichiers sous `runs/T012/`,
  aucun fichier sous `backend/` ni ailleurs dans le code applicatif.
- `ls` de la racine du worktree : `ai/`, `docs/`, `prompts/`, `runs/`,
  `tickets/` uniquement — pas de `backend/` ni de `frontend/`.
- `git merge-base --is-ancestor ticket/T009-bootstrap-spring-boot-backend HEAD`
  → T009 non mergé.
- `git merge-base --is-ancestor ticket/T007-create-cra-creation-api HEAD`
  → T007 non mergé.
- Plan T012 relu : les hypothèses de départ listées en tête du plan
  (Assumptions on starting state) sont explicitement fausses.
- Instruction du plan : « If any assumption above is false at ticket start,
  the Coder must stop and flag it before making changes; do not silently
  expand scope to bootstrap the missing pieces ».
- Skills `workflow-discipline` et `refactor-safety` du rôle Coder : interdisent
  d'étendre le scope pour bootstrap l'ensemble d'un module Spring Boot depuis
  zéro dans le cadre de ce ticket.

## Points validés

- Discipline de workflow respectée par le Coder : blocage explicite,
  documenté, sans expansion silencieuse du scope. Conforme à l'instruction
  du plan et aux règles `workflow-discipline` / `refactor-safety`.
- Aucun changement dangereux, aucun refactor transversal introduit.
- Aucune fuite de secret, aucun log sensible, aucune opération destructive.
- L'artefact `implementation-output.md` identifie clairement la cause racine
  et propose des pistes de remédiation à l'opérateur (merger/rebaser les
  prérequis, ou re-planifier avec un scope bootstrap explicitement élargi).

## Problèmes détectés

Bloquants (empêchent l'approbation) :

1. **Aucun critère d'acceptation du ticket n'est satisfait.** L'endpoint
   `PATCH /api/cras/{craId}/days/{date}` n'existe pas, aucun test n'a été
   ajouté, la suite `mvn test` ne peut même pas être exécutée puisqu'il n'y
   a pas de module Maven. Le ticket est en l'état non livrable.
2. **La cause racine est en amont du Coder, mais nécessite une action avant
   qu'une implémentation puisse être approuvée.** Le plan a été rédigé sur
   des hypothèses de départ qui ne sont pas remplies dans la base de la
   branche T012. Le Coder n'est pas la bonne étape pour corriger cela ; il
   faut soit :
   - rebaser/merger dans la base de T012 les branches prérequises
     (au minimum T009 pour le module Spring Boot ; probablement aussi
     T002, T003, T004, T005 pour entités/DTO/repositories, et éventuellement
     T007 si `CraDayEntry` y est provisionné à la création de CRA) ;
   - **ou** re-planifier T012 avec un scope bootstrap explicite et assumé,
     ce qui contredit à la fois le plan actuel et l'esprit de découpage des
     tickets ; option non recommandée sans décision produit.

Non bloquants :

- Le plan référence deux hiérarchies de packages divergentes
  (`com.timizer.backend.cra` pour les entités et
  `com.timizerlike.backend.cra.dto` / `com.timizerlike.cra.service` pour le
  reste). C'est signalé dans le plan comme préexistant et hors scope. À
  garder en tête pour éviter tout renommage opportuniste lors de la reprise.

## Risques éventuels

- Si l'opérateur décide de merger les prérequis dans la base de T012 sans
  rebaser T012 après coup, les hypothèses du plan (chemins de fichiers,
  noms de packages, statuts `ValidationStatus`) pourraient différer
  légèrement de ce qui existe réellement dans T009/T002/T003/T004/T005/T007.
  Le Coder devra revérifier chaque hypothèse avant de coder, comme le plan
  l'exige déjà.
- Si l'opérateur choisit de re-planifier T012 avec un scope élargi, il y a
  un risque fort de dérive : le ticket deviendrait un « bootstrap + API »
  qui recouvrirait matériellement plusieurs tickets déjà existants.
  Fortement déconseillé.

## Décision

- REQUEST_CHANGES

Motivation : conformément au workflow, une implémentation qui ne satisfait
aucun critère d'acceptation ne peut pas être approuvée, même quand le
blocage a une cause légitime en amont. L'approbation reprendra une fois que
la base de T012 contiendra les prérequis attendus par le plan (ou que le
plan aura été révisé de manière explicite pour refléter la nouvelle réalité
de la base).

## Actions demandées

Pour l'opérateur (hors périmètre Coder) :

1. Décider de la stratégie : rebase/merge des prérequis dans la base de
   T012 (recommandé), ou re-plan T012 avec bootstrap élargi (non recommandé).
2. Si option « rebase/merge des prérequis » retenue :
   - merger/rebaser au minimum T009 (bootstrap Spring Boot) puis les
     tickets d'entités/DTO/repository (T002 → T003 → T004 → T005) et
     T007 dans la base de T012, dans l'ordre de dépendance ;
   - relancer le Coder sur le même plan ; il pourra alors vérifier les
     hypothèses réelles et implémenter.
3. Si option « re-plan » retenue : renvoyer T012 au Planner avec instruction
   explicite d'élargir le scope, et documenter la déviation dans le ticket
   et le plan (décision produit requise).

Pour le Coder, une fois les prérequis en place :

- Reprendre les étapes 1–7 du plan telles quelles.
- Vérifier point par point les hypothèses de départ (noms de packages,
  présence de `MonthlyCraReportRepository`, énum `ValidationStatus`) et
  signaler tout écart avant d'implémenter.

IMPLEMENTATION_FIX_REQUIRED
