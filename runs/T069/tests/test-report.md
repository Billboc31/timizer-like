---

## Rapport de test — T069

**7/7 critères validés — TESTS_PASSED**

| Critère | Statut |
|---|---|
| Tout écran authentifié expose un retour vers l'accueil | ✅ PASS |
| Clic sur "Accueil" ouvre le calendrier annuel | ✅ PASS |
| Clic sur le logo navigue également vers l'accueil | ✅ PASS |
| État actif correct sur la route home | ✅ PASS |
| Retour à l'accueil ne crée/modifie aucun CRA | ✅ PASS |
| Lien accessible au clavier + label accessible | ✅ PASS |
| Desktop et mobile exposent tous deux l'action | ✅ PASS |

**Aucune régression détectée** sur les items de navigation existants, la gestion du focus, ou l'intercepteur `onNewCra`.

**Observation non-bloquante** : la navigation reste purement état-React sans `window.history` — le bouton retour navigateur n'est pas affecté, ce comportement pré-existait et n'est pas une régression de T069.

Le rapport est enregistré dans `runs/T069/test-report.md`.
