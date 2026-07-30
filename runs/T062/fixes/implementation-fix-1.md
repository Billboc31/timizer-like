# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T062/reviews/implementation-review.md
- generated at: 2026-07-30T00:12:23Z

---

I now have everything I need. Let me write the review.

---

# PR Review — T062: Replace New CRA home page with global calendar overview

## Résumé

L'implémentation est fonctionnellement correcte et bien structurée. La route `/` affiche désormais `CraOverview`, le titre passe à "Mes CRA", l'état vide dispose d'un appel à l'action, et les flux d'édition existants continuent de fonctionner. Deux problèmes bloquants sont néanmoins présents dans la couche de tests, qui empêcheront la CI de passer en l'état.

## Vérifications effectuées

- Lecture complète de `CraOverview.tsx`, `CraOverview.css`, `App.tsx`, `AppShell.tsx`, `App.test.tsx`
- Vérification du `git diff` complet entre la base et le HEAD (tous les fichiers modifiés)
- Vérification du type `CraSummaryDto` dans `api/types.ts`
- Comparaison avec les critères d'acceptation du plan et du ticket

## Points validés

- **Vue par défaut** : `useState<View>('overview')` — la page d'accueil ne démarre plus sur `CraMonthSelector`. ✓
- **Titre** : `PAGE_TITLES` inclut `overview: 'Mes CRA'`. ✓
- **État vide** : bouton "Nouveau CRA" → `onNewCra()` → `setView('selector')`. ✓
- **Ouverture d'un CRA existant** : clic sur card → `handleOpen(cra)` + `setView('selector')` — comportement identique à l'existant. ✓
- **Navigation History/Paramètres** : inchangée. ✓
- **Abort controller** : `useEffect` nettoie correctement l'appel `listCras` au démontage. ✓
- **Accessibilité** : `role="list"`, `aria-label`, `aria-busy`, `aria-current`, `focus-visible`. ✓
- **Responsive** : breakpoint `640px` avec `flex-direction: column`. ✓
- **Tri** : année desc, puis mois desc — le plus récent en premier. ✓
- **États de statut** : tous les 6 statuts du domaine couverts (`DRAFT`, `READY_FOR_PROVIDER_SIGNATURE`, `SIGNED_BY_PROVIDER`, `AWAITING_CLIENT_SIGNATURE`, `FULLY_SIGNED`, `VALIDATED`). ✓

## Problèmes détectés

### 🔴 BLOQUANT 1 — Fixtures de tests incomplètes : erreur TypeScript

**Fichier** : `App.test.tsx` lignes 11–17 et 40–47

`CraSummaryDto` dans `api/types.ts` déclare `clientSignatureDate: string | null` comme champ **requis** (non optionnel). Les fixtures `SUMMARY` et `HISTORY_SUMMARY` omettent ce champ :

```ts
const SUMMARY: CraSummaryDto = {
  id: 1, month: 7, year: 2026, totalWorkedDays: 20, status: 'DRAFT',
  validationDate: null,
  // ❌ manque clientSignatureDate
};
```

TypeScript rejettera ces fixtures à la compilation (`Type '{ ... }' is missing the following properties from type 'CraSummaryDto': clientSignatureDate`). La CI ne passera pas.

**Correction** : ajouter `clientSignatureDate: null` aux deux fixtures.

---

### 🔴 BLOQUANT 2 — Les tests D1 échouent à cause du changement de vue par défaut

**Fichier** : `App.test.tsx`, `describe('App — D1: getCra on open')`, lignes 112–172

Ces quatre tests supposent que l'application démarre sur la vue `'selector'` (ex-défaut). Chacun attend :

```ts
await waitFor(() => expect(screen.getByText('Open CRA')).toBeInTheDocument());
```

Le texte `'Open CRA'` est rendu par `CraMonthSelector` (ligne 96 : `existingCra ? 'Open CRA' : 'Create CRA'`). Or, la vue initiale est désormais `'overview'` — `CraMonthSelector` n'est pas monté au démarrage. Ces assertions expireront systématiquement.

De plus, `listCras` est mocké avec `[SUMMARY]`, donc `CraOverview` s'affiche avec une carte "July 2026" dont le bouton a pour `aria-label` `"Ouvrir le CRA de July 2026"` — pas de texte `'Open CRA'` visible.

**Correction** : mettre à jour les tests D1 pour refléter le nouveau flux. Deux options :
- Tester l'ouverture d'un CRA *depuis l'overview* (clic sur `aria-label="Ouvrir le CRA de July 2026"`)
- Tester l'ouverture depuis `CraMonthSelector` en naviguant d'abord vers la vue `'selector'` via un `fireEvent.click` sur le bouton "New CRA"

---

### 🟡 MINEUR 1 — Noms de mois en anglais

**Fichier** : `CraOverview.tsx` lignes 7–10

```ts
const MONTH_NAMES = ['January', 'February', 'March', ...];
```

Résultat : `aria-label="Ouvrir le CRA de July 2026"` — mélange français/anglais incohérent avec le reste de l'UI. `CraHistory` affiche également des mois en anglais ("June 2026"), mais l'architecture globale de l'app est en français. À uniformiser.

---

### 🟡 MINEUR 2 — Bouton "Réessayer" sans classe CSS

**Fichier** : `CraOverview.tsx` ligne 100

```tsx
<button onClick={() => { loadCras(); }}>Réessayer</button>
```

Pas de classe appliquée — bouton rendu avec le style navigateur par défaut, contrairement au bouton "Nouveau CRA" de l'état vide qui utilise `.cra-overview__btn--primary`. Incohérence visuelle.

---

### 🟡 MINEUR 3 — Aucun test unitaire pour `CraOverview`

Aucun fichier `CraOverview.test.tsx` n'a été ajouté. Les états loading, error, empty et la liste sont non couverts au niveau unitaire. Non bloquant pour le ticket (pas explicitement requis), mais à noter.

## Risques éventuels

- La navigation vers l'overview depuis les autres vues est absente (pas de bouton "Mes CRA" dans l'AppShell). Si l'utilisateur navigue vers History ou Settings, il ne peut revenir à l'overview sans recharger la page. Ce point est **explicitement hors scope** du plan ("Left sidebar navigation redesign — AppShell header stays as-is"), donc non bloquant pour cette review.

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[OBLIGATOIRE]** Ajouter `clientSignatureDate: null` aux fixtures `SUMMARY` et `HISTORY_SUMMARY` dans `App.test.tsx`.
2. **[OBLIGATOIRE]** Corriger les 4 tests de `describe('App — D1')` pour tester l'ouverture d'un CRA depuis la nouvelle vue `'overview'` (ou naviguer vers `'selector'` en préambule).
3. **[RECOMMANDÉ]** Remplacer `MONTH_NAMES` par des noms français dans `CraOverview.tsx`.
4. **[RECOMMANDÉ]** Ajouter `className="cra-overview__btn"` au bouton "Réessayer" (ligne 100).

IMPLEMENTATION_FIX_REQUIRED
