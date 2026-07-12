# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T022/reviews/implementation-review.md
- generated at: 2026-07-12T16:13:06Z

---

I have all the information needed. Here is the structured review:

---

# PR Review — T022: Create CRA total summary panel

## Résumé

9 fichiers source modifiés (5 backend, 4 frontend). L'implémentation couvre correctement tous les critères d'acceptance dans le composant et les tests — mais **un fichier critique est toujours manquant**, empêchant la compilation TypeScript. Ce problème avait déjà été signalé en review-attempt-1 et n'a pas été corrigé dans coder-attempt-2.

## Vérifications effectuées

- Ticket T022 lu et critères d'acceptance vérifiés
- Plan `runs/T022/plan.md` consulté
- Les 9 fichiers source du diff lus en intégralité
- Existence de `frontend/src/api/` vérifiée par glob (résultat: absent)
- Reviews précédentes consultées (`implementation-review.md`, `review-attempt-1.md`)

## Points validés

**Backend**
- `CraDetailsDto` : 6 nouveaux champs provider/client ajoutés correctement en tant que `String` nullable
- `CraDetailsMapper.toDto()` : mappe les 6 champs depuis `MonthlyCraReport`, calcul de `totalWorkedDays` par boucle — minimal et acceptable
- `CraDtoTest` : test `craDetailsDtoRoundTrip()` mis à jour à 14 arguments, assertions sur les 6 nouveaux champs
- `CraDayControllerTest` / `CraValidationControllerTest` : constantes `DRAFT_DTO` et `VALIDATED_DTO` mises à jour à 14 arguments — logique des tests inchangée

**Frontend**
- `types/cra.ts` : 6 champs optionnels `string | null` ajoutés à `CraDetails` — cohérence avec le DTO backend
- `CraSummaryPanel.tsx` : composant purement présentationnel, props-driven. Affiche tous les champs requis (période, statut, total, provider, company, client). États loading/error/null gérés. HTML sémantique (`<section aria-label>`, `<dl>/<dt>/<dd>`). Fallback `'—'` pour les noms null
- `CraSummaryPanel.test.tsx` : 12 tests couvrant les 6 champs, la réactivité via `rerender`, les états loading/error/null, et les fallbacks null — couverture solide
- `App.tsx` : `CraSummaryPanel` intégré et rendu avec les props `cra`, `loading`, `error` — réactivité assurée par le state React existant

## Problèmes détectés

### [BLOQUANT] `frontend/src/api/cra.ts` manquant — deuxième signalement

`App.tsx` ligne 2 importe `fetchCra` depuis `'./api/cra'` :

```typescript
import { fetchCra } from './api/cra';
```

Le répertoire `frontend/src/api/` n'existe pas. Ce problème a été signalé dans `review-attempt-1` comme bloquant. `coder-attempt-2` n'a pas créé ce fichier. La compilation TypeScript échoue, l'application ne peut pas démarrer.

**Action requise** : créer `frontend/src/api/cra.ts` exposant :

```typescript
import type { CraDetails } from '../types/cra';

export async function fetchCra(year: number, month: number): Promise<CraDetails> {
  const res = await fetch(`/api/cras?year=${year}&month=${month}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json() as Promise<CraDetails>;
}
```

L'URL exacte doit correspondre à l'endpoint backend existant.

### [Mineur] Incohérence de package Java

`CraDetailsMapper` est déclaré dans `com.timizer.backend.cra` tandis que les DTOs sont dans `com.timizerlike.backend.cra.dto`. Ce pattern double-package était présent avant ce ticket — à confirmer si convention existante, sinon à corriger pour cohérence.

### [Observation] Période hardcodée dans App.tsx

`fetchCra(2026, 7)` et `<h1>CRA — July 2026</h1>` sont hardcodés. Acceptable dans le scope de ce ticket (sélecteur de période hors scope), mais à paramétrer lors de l'ajout du sélecteur.

## Risques éventuels

- **Totalisation hors scope** : le ticket marque "Backend total calculation implementation" hors scope, mais le mapper calcule `totalWorkedDays` par sommation. Cette logique est minimale et nécessaire pour alimenter le DTO — acceptable.
- **Mise à jour du total** : l'AC "Total updates after a day value change" repose sur le fait que `CalendarGrid` déclenche une mise à jour du state `cra` dans `App.tsx`. Ce câblage n'est pas visible dans les fichiers de ce ticket — à vérifier que `CalendarGrid` appelle `setCra` ou un équivalent lors d'une modification.

## Décision

REQUEST_CHANGES — 1 bloquant persistant non résolu après deux tentatives coder.

## Actions demandées

1. **[Bloquant]** Créer `frontend/src/api/cra.ts` avec la fonction `fetchCra(year: number, month: number): Promise<CraDetails>` appelant l'endpoint backend réel.
2. **[Vérification]** Confirmer que `CalendarGrid` propage les mises à jour de jour dans le state `cra` de `App.tsx` (prérequis pour l'AC "Total updates after a day value change").

---

IMPLEMENTATION_FIX_REQUIRED
