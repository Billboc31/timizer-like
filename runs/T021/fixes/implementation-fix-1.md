# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T021/reviews/implementation-review.md
- generated at: 2026-07-20T09:50:13Z

---

Now I have everything needed to write the review.

---

# PR Review — T021: Create calendar day click cycle

## Résumé

L'implémentation couvre correctement le périmètre du ticket : cycle 0→1→0.5→0 sur les cellules jour, persistence via `PATCH /api/cras/{id}/days/{date}`, états visuel saving/error, et verrouillage des CRA validés. Trois fichiers modifiés, scope parfaitement contenu.

Un problème de type safety bloquant est présent sur la prop `onCraUpdate`.

---

## Vérifications effectuées

- Lecture du composant `CalendarGrid.tsx` (110 lignes)
- Lecture des styles `CalendarGrid.css`
- Lecture des tests `CalendarGrid.test.tsx` (159 lignes)
- Vérification de l'interface `CraDetails` (`types/cra.ts`) vs `CraDetailsDto` (`api/types.ts`)
- Vérification des usages de `CalendarGrid` dans le reste du projet
- Vérification de la signature de `updateDay` dans `craClient.ts`

---

## Points validés

- **Cycle de valeurs correct** : `nextWorkValue` implémente bien 0→1→0.5→0 (`CalendarGrid.tsx:8-12`)
- **Persistance API** : chaque clic appelle `updateDay(craId, isoDate, { workValue: next })` (`CalendarGrid.tsx:50`)
- **Format ISO** : date construite avec zero-padding (`${cra.year}-${pad(cra.month)}-${pad(day)}`) — correct
- **Calcul jours/mois** : `new Date(cra.year, cra.month, 0).getDate()` — trick correct pour mois 1-indexé
- **Concurrence** : guard `if (savingDays.has(day)) return` empêche les double-clics (`CalendarGrid.tsx:40`)
- **État saving** : classe `day-cell--saving` + `pointer-events: none` pendant l'inflight
- **État erreur** : classe `day-cell--error` + message texte affiché, effacé au prochain clic
- **Verrouillage VALIDATED** : pas de `onClick` attaché + classe `day-cell--locked` (`CalendarGrid.tsx:98`)
- **Tests complets** : 7 nouveaux cas couvrant tous les critères d'acceptance
- **Scope respecté** : aucun changement backend, aucune régression sur layouts ou autres features

---

## Problèmes détectés

### [BLOQUANT] Cast `as unknown as CraDetails` — type safety brisée

**Fichier** : `CalendarGrid.tsx:56`

```typescript
onCraUpdate?.(result as unknown as CraDetails);
```

`updateDay` retourne `Promise<CraDetailsDto>` (de `api/types.ts`) où `CraDayEntryDto.note` est `string | null`. La prop `onCraUpdate` est typée `(updated: CraDetails) => void` où `CraDayEntry.note` est `string`. Le cast double `as unknown as` supprime toute vérification TypeScript et garantit silencieusement un contrat de type incorrect au callsite.

Un futur parent appelant `onCraUpdate` recevra un objet où `day.note` peut être `null`, alors que le type déclare `string` — risque de crash runtime si du code fait `.toLowerCase()` ou autre opération string sur `note`.

**Correction attendue** (minimaliste) :

```typescript
// CalendarGrid.tsx — changer la Props interface
import type { CraDetailsDto } from '../../api/types';

interface Props {
  cra: CraDetails | null;
  loading: boolean;
  error: string | null;
  onCraUpdate?: (updated: CraDetailsDto) => void;  // ← DTO réel
}

// puis ligne 56 :
onCraUpdate?.(result);  // plus de cast nécessaire
```

---

## Risques éventuels

- **Mineure** : test de verrouillage VALIDATED (`CalendarGrid.test.tsx:155`) utilise `setTimeout(r, 50)` comme fence — fragile si la machine est lente. Remplacer par `await new Promise<void>(r => setTimeout(r, 50)); expect(mockUpdateDay).not.toHaveBeenCalled()` est suffisant mais un `waitFor(() => ..., { timeout: 50 })` serait plus idiomatique. Non bloquant pour ce ticket.
- **Mineure** : `handleDayClick` défini à l'intérieur du composant, re-créé à chaque render. Acceptable pour un MVP sans profiling de perf.
- **Constat** : `CalendarGrid` n'est pas encore intégré dans `App.tsx`. Le problème de type n'a donc aucun impact runtime actuellement, mais doit être corrigé avant l'intégration.

---

## Décision

Le ticket est bien implémenté dans son ensemble. Un seul point bloque : le cast `as unknown as CraDetails` viole le contrat de type de la prop publique `onCraUpdate` et doit être corrigé avant approbation. La correction est triviale (changer le type de la prop, supprimer le cast).

## Actions demandées

1. Dans `CalendarGrid.tsx` : importer `CraDetailsDto` depuis `../../api/types` et typer `onCraUpdate?: (updated: CraDetailsDto) => void` — supprimer le `as unknown as CraDetails`.

IMPLEMENTATION_FIX_REQUIRED
