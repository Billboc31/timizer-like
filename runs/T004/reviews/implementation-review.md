Review written to `runs/T004/reviews/review-attempt-1.md`.

**Décision : IMPLEMENTATION_APPROVED**

Résumé :
- Le périmètre strict T004 (`MonthlyCraReportRepository` + delta `@OneToMany` sur `MonthlyCraReport` + 8 tests `@DataJpaTest`) est conforme au ticket et au plan.
- Delta sur `MonthlyCraReport` vérifié chirurgical (diff avec la branche T002) : imports + champ `dayEntries` + `add/removeDayEntry` uniquement.
- Tous les critères d'acceptation du plan sont couverts par un test dédié.
- Aucun scope creep (pas de service, controller, DTO, config).

Points d'attention non-bloquants signalés pour l'intégration :
1. `CraDayEntry` diverge de la version T003 (choix `@ManyToOne` vs `Long monthlyCraId`, contraintes/validations manquantes) — inévitable car T003 absent de la branche T004 ; réconciliation attendue au merge.
2. Tests non exécutables ici (pas de `pom.xml`, pas de `ValidationStatus`) — vérification reportée à l'intégration complète (T002+T003+T004+T009).
3. Duplication whole-file de `MonthlyCraReport.java` (artefact de branche, conflit attendu au merge — pattern T002 déjà validé).
