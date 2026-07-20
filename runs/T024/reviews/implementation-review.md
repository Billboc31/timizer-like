## PR Review — T024: Create PDF download UI

### Résumé

L'implémentation couvre correctement la fonctionnalité PDF demandée par T024 : `apiGetBlobWithMeta`, `parseFilenameFromDisposition`, mise à jour de `downloadCraPdf`, bouton conditionnel VALIDATED/DRAFT, gestion d'erreur avec `role="alert"`. **42 tests passent.**

Cependant, deux éléments bloquants sont hors scope.

---

### Points validés

- `parseFilenameFromDisposition` gère correctement `filename=`, `filename="..."`, et `filename*=UTF-8''…`
- `apiGetBlob` préservé intact (pas de régression)
- Bouton rendu uniquement si `status === 'VALIDATED'`, absent pour DRAFT
- `disabled` pendant le téléchargement en vol
- Fallback filename : `cra-{year}-{month}.pdf`
- `URL.revokeObjectURL` appelé après download
- 5 tests de téléchargement couvrent tous les cas requis

---

### Problèmes détectés

**[BLOQUANT] Scope drift : day-click cycling dans CalendarGrid**

Le diff ajoute un ensemble complet hors-plan : `handleDayClick`, `savingDays`, `dayErrors`, `onCraUpdate`, `nextWorkValue`, `pad`, 3 classes CSS (`.day-cell--locked/.saving/.error`), et **7 tests "click cycling"** entièrement nouveaux. Rien de tout cela n'apparaît dans le plan T024 approuvé. Ces changements appartiennent à un autre ticket et doivent être extraits.

**[BLOQUANT] Dépendance `lru-cache` ajoutée sans justification**

`package.json` inclut `lru-cache@^11.5.2` comme devDependency. Non référencée dans le code T024, aucune justification dans le plan.

**[MINEUR] `a.click()` sans attachement au DOM**

L'ancre créée programmatiquement n'est pas appendée au `document.body` avant `.click()`. Firefox peut ignorer silencieusement ce téléchargement. Pattern robuste : `document.body.appendChild(a); a.click(); document.body.removeChild(a)`.

**[MINEUR] `.calendar-download` non défini dans CalendarGrid.css**

---

### Actions demandées

1. Extraire le day-click cycling de cette PR (ticket séparé)
2. Supprimer `lru-cache` de `package.json`
3. Attacher l'ancre au DOM avant `.click()`
4. Définir `.calendar-download` en CSS

---

IMPLEMENTATION_FIX_REQUIRED
