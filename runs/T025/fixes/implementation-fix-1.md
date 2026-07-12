# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T025/reviews/implementation-review.md
- generated at: 2026-07-12T17:14:12Z

---

# PR Review — T025: Create CRA History Page

## Résumé

Implémentation globalement solide et dans le scope. Le composant `CraHistory`, ses styles, ses tests et le câblage `App.tsx` sont en place. Cinq des six critères d'acceptance sont respectés. Un problème bloquant est identifié.

---

## Points validés

- Listing CRA via `listCras()` au montage, tableau avec colonnes Period / Status / Worked Days / Validation Date / Actions
- États vide (`"No CRA records found."`), chargement (`"Loading..."`), et erreur API (`role="alert"`) correctement gérés
- Bouton "Open" sur chaque ligne, gating du bouton "Download PDF" sur `status === 'VALIDATED'`
- État `downloading` par ID pour désactiver le bouton en cours sans bloquer les autres lignes
- 10 tests couvrant tous les états et les interactions principales
- Scope respecté : pas de routeur, pas de backend modifié, navigation par état dans `App.tsx`

---

## Problème bloquant

### Erreurs de téléchargement PDF silencieusement ignorées

**`CraHistory.tsx:44`**

```tsx
.catch(() => {})
```

Si `downloadCraPdf` échoue, l'erreur est avalée sans aucun retour utilisateur. L'AC « error states are handled » n'est pas respecté pour ce cas.

**Correction minimale** — remplacer le `.catch(() => {})` par :

```tsx
.catch((err: unknown) => {
  setError(err instanceof Error ? err.message : 'Failed to download PDF');
})
```

---

## Observations non bloquantes

1. **`a.click()` sans append au DOM** (`CraHistory.tsx:41–43`) — pattern fonctionnel sur les navigateurs modernes, mais `appendChild` + `remove` est plus robuste.
2. **`CraDetailsDto` re-déclare `validationDate`** redondamment (`types/cra.ts:27`) — hérité de `CraSummaryDto`, re-déclaration inutile.
3. **`api/types.ts` non mis à jour** — ce fichier parallèle définit son propre `CraSummaryDto` sans `validationDate`. Pas de régression fonctionnelle (non utilisé par `CraHistory`), mais dette technique préexistante.
4. **Pas d'indicateur visuel de vue active** dans la nav — hors AC.
5. **Test PDF** ne vérifie pas le clic sur l'ancre ni `revokeObjectURL`, seulement l'appel API.

---

IMPLEMENTATION_FIX_REQUIRED
