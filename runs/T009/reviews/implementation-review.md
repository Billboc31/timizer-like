Review written to `runs/T009/reviews/review-attempt-1.md`.

## Résumé

**Décision : APPROVED**

L'implémentation respecte strictement le ticket T009 et le plan approuvé :
- Structure `backend/` conforme (pom.xml Spring Boot 3.3.5, Java 21, main class, HealthController, application.properties, mvnw).
- Dépendances limitées à `spring-boot-starter-web` + `spring-boot-starter-actuator` (aucun scope hors périmètre).
- `git diff --stat` confirme qu'aucun fichier existant n'est modifié.
- Actuator exposé au strict minimum (`include=health`, pas de `*`) — bonne posture sécurité.
- Déviation `mvnw.ps1` correctement justifiée (invoquée par `mvnw.cmd`).

**Limite de la review** : pas de JDK 21 dans le sandbox, donc les critères runtime (`./mvnw spring-boot:run`, `curl /health`, `package`) n'ont pas pu être exécutés — analyse statique uniquement. Le code étant du boilerplate Spring Boot standard, aucun problème bloquant n'est attendu au démarrage, mais une validation locale par le mainteneur est recommandée avant merge final.

Aucune action bloquante — deux recommandations non-bloquantes documentées dans la review pour un ticket ultérieur.
