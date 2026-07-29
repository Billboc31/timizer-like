# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T061/reviews/implementation-review.md
- generated at: 2026-07-29T17:43:03Z

---

I have reviewed all the relevant files. Let me now write the structured review.

---

## PR Review — T061 : Add New CRA period selection dialog

### Résumé

L'implémentation ajoute correctement un bouton « New CRA » dans la navigation, ouvre un dialogue natif `<dialog>` avec deux champs de date, valide la saisie, crée ou réutilise un CRA existant, puis ouvre le calendrier sur le mois de début. Le périmètre est bien respecté.

Deux problèmes sont cependant identifiés : un bug logique sur `selectedPeriod` et une absence totale de tests pour `NewCraDialog`, incompatible avec la convention uniforme du projet.

---

### Vérifications effectuées

- Ticket vs implémentation (tous les acceptance criteria)
- Plan vs code produit (tous les fichiers listés, logique `handleNewCraConfirm`)
- Typage TypeScript (`createCra` retourne `CraDetailsDto`, passé à `handleOpen(CraSummaryDto)` — compatible structurellement ✅)
- Focus management et focus trap (pattern identique à `CraPeriodNavigator` ✅)
- Gestion ESC via `onCancel` natif (pas de `preventDefault`, comportement attendu ✅)
- Cohérence CSS avec les variables design system existantes ✅
- Couverture de tests du projet (`frontend/src/components/**/*.test.*`)

---

### Points validés

- Bouton « New CRA » présent dans `AppShell` sur toutes les vues authentifiées ✅
- Dialogue s'ouvre sans navigation (`showModal()` contrôlé par `open` prop) ✅
- Valeurs par défaut au premier/dernier jour du mois courant ✅
- Validation inline : champs requis + `endDate >= startDate` ✅
- Erreur serveur affichée dans le dialogue via `error` prop + `role="alert"` ✅
- Annulation (bouton Cancel ou ESC) ne crée/modifie aucun CRA ✅
- Retour de focus sur le bouton déclencheur (`newCraTriggerRef`) ✅
- Focus trap sur Tab/Shift+Tab dans le dialogue ✅
- Réutilisation du CRA existant via `listCras()` avant `createCra()` ✅
- Compatibilité future left-sidebar via `onNewCra` prop ✅
- Aucune régression TypeScript signalée ✅

---

### Problèmes détectés

#### 🔴 Bloquant 1 — `selectedPeriod` est systématiquement effacé

**Localisation :** `frontend/src/App.tsx:115-117` et `handleNewCraConfirm` lignes 150–168

**Code problématique :**
```tsx
// App.tsx:115-117
useEffect(() => {
  if (cra === null) setSelectedPeriod(null);
}, [cra]);
```

**Séquence réelle à l'exécution :**
1. `setSelectedPeriod({ startDate, endDate })` — la valeur est posée
2. `handleOpen(existing)` → `loadCra(id)` → `setCra(null)` (synchrone)
3. React batch les setState et rend → `cra === null`
4. L'effet `[cra]` s'exécute → `setSelectedPeriod(null)` — la valeur est effacée
5. `getCra(id)` résout → `setCra(dtoToDetails(dto))` → l'effet se ré-exécute mais `cra !== null`, donc `selectedPeriod` reste `null`

`selectedPeriod` est donc **toujours `null`** une fois le CRA chargé. L'acceptance criterion du plan n'est pas respecté :
> "The flow works for periods spanning multiple months (the CRA is created for the start month; the end-date value is preserved in `selectedPeriod` state)"

**Fix attendu :** Ne pas effacer `selectedPeriod` pendant le chargement. Par exemple, ne le faire qu'en réponse à une action explicite (réinitialisation de session, retour au sélecteur sans CRA actif), séparé du signal de chargement. Une approche simple :

```tsx
// Supprimer l'effet existant et gérer la réinitialisation explicitement
// Par exemple, uniquement dans handleNewCraCancel ou lors d'une déconnexion
```

---

#### 🔴 Bloquant 2 — Absence totale de tests pour `NewCraDialog`

**Convention du projet :** 100 % des composants ont un fichier `.test.tsx`. La quasi-totalité des composants de dialogue ont aussi un `.axe.test.tsx` :
- `CraPeriodNavigator` → `.test.tsx` + `.axe.test.tsx`
- `CraValidation` → `.test.tsx` + `.axe.test.tsx`
- `CraSummaryPanel` → `.test.tsx` + `.axe.test.tsx`
- `ProviderSignatureBox` → `.test.tsx` + `.axe.test.tsx`

`NewCraDialog` n'a ni `.test.tsx` ni `.axe.test.tsx`. Cette absence rompt la convention uniforme et laisse sans couverture la logique de validation, le focus trap, et l'intégration `open`/`close`.

**Tests minimaux attendus :**
- Rendu avec `open=false` (dialog non visible)
- Rendu avec `open=true` (dialog visible)
- Soumission avec champs vides → message d'erreur inline
- Soumission avec `endDate < startDate` → message d'erreur inline
- Soumission valide → `onConfirm` appelé avec les bonnes dates
- Clic Annuler → `onCancel` appelé
- Affichage de `error` prop
- Désactivation inputs/boutons quand `loading=true`
- Test axe (accessibilité) en état ouvert

---

### Risques éventuels

- **Mineur :** `PAGE_TITLES['selector'] = 'New CRA'` dans `AppShell.tsx:16` — le titre de page affiché après confirmation sera "New CRA" même si l'utilisateur a simplement ouvert un CRA existant depuis `CraMonthSelector`. Ce n'était pas le cas avant le changement (`CraMonthSelector` était la page selector ; le titre peut être trompeur).
- **Mineur :** Les valeurs de date ne sont pas réinitialisées à la réouverture du dialogue (si l'utilisateur modifie les dates, annule, puis rouvre). Le ticket ne l'exige pas explicitement, mais peut surprendre.

---

### Décision

Deux corrections requises avant approbation :
1. Corriger le bug `selectedPeriod` (logique de clearing incorrecte)
2. Ajouter les fichiers `NewCraDialog.test.tsx` et `NewCraDialog.axe.test.tsx`

IMPLEMENTATION_FIX_REQUIRED
