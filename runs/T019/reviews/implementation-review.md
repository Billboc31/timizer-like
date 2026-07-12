---

## PR Review — T019 CraMonthSelector

### Résumé

L'implémentation couvre le composant `CraMonthSelector`, la couche API, les types TypeScript, l'intégration dans `App.tsx` et une suite de 9 tests Vitest. Revue complète effectuée.

### Points validés

| Critère ticket | Status |
|---|---|
| Sélection du mois (dropdown 1–12) | ✅ |
| Sélection de l'année (input number) | ✅ |
| Ouverture d'un CRA existant ("Open CRA") | ✅ |
| Création d'un CRA inexistant ("Create CRA") | ✅ |
| Affichage clair de la période (ex. "July 2026") | ✅ |
| État loading pendant `listCras()` | ✅ |
| État erreur (chargement + création) | ✅ |
| Scope respecté (pas de grille, pas de backend) | ✅ |
| TypeScript strict, 9 tests passants | ✅ |

### Problèmes détectés (mineurs, non bloquants)

1. **Validation année uniquement HTML** — `min={2000}` sur l'input ne bloque pas l'état React ; une saisie `1999` serait transmise à `createCra`.
2. **Champ année vidé** — `Number('') === 0` stocké dans l'état, affiche "Create CRA" avec une période invalide.
3. **Asymétrie routes API** — `GET /api/cras` (pluriel) vs `POST /api/cra` (singulier) à vérifier lors de l'intégration backend.
4. **Pas de retry** sur erreur de chargement (UX bloquante, non exigé par le ticket).

### Décision

Aucun bloquant. Tous les critères d'acceptation sont satisfaits.

IMPLEMENTATION_APPROVED
