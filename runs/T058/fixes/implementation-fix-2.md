# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T058/reviews/implementation-review.md
- generated at: 2026-07-28T11:07:05Z

---

I now have a complete picture. Let me write the structured review.

---

# PR Review — T058: Rectangular Provider Signature Box in CRA UI and PDF

## Résumé

L'implémentation pose des bases solides : le composant `ProviderSignatureBox` est bien construit (BEM, tokens CSS, accessibilité, tests), le générateur PDF produit un bloc rectangulaire avec padding et préservation de ratio, et les tests backend sont cohérents. Cependant, deux problèmes bloquants rendent l'état signé partiellement non fonctionnel en production : le nom du prestataire ne s'affiche jamais, et l'image de signature ne peut jamais être fournie via l'API actuelle.

---

## Vérifications effectuées

- Composant React `ProviderSignatureBox.tsx` et CSS associé
- Tests unitaires et accessibilité (axe)
- Mapper frontend `dtoToDetails` dans `App.tsx`
- Types API `frontend/src/api/types.ts` et `frontend/src/types/cra.ts`
- DTO backend `CraDetailsDto.java` et mapper `CraDetailsMapper.java`
- Générateur PDF `CraPdfGenerator.java` et tests `CraPdfGeneratorTest.java`
- Modèles PDF `CraPdfProviderSignature.java`, `CraPdfSignatures.java`

---

## Points validés

- Le composant `ProviderSignatureBox` implémente correctement les deux états (vide / signé) avec les bonnes classes CSS
- État vide : bordure tiretée, texte d'invitation "Cliquez pour signer", `role="button"`, `tabIndex={0}`, support clavier Enter/Space
- État signé : bordure pleine, image conditionnelle, footer avec nom + date `dd/MM/yyyy`
- CSS : tokens CSS exclusivement, `object-fit: contain`, flexbox, responsive `@media (max-width: 480px)`
- Tests unitaires : 11 cas couvrant état vide, état signé, toggling de classes, edge cases (nom absent, image absente)
- Tests axe : zéro violation en état vide et signé
- Générateur PDF : rectangle dessiné, padding `SIGNATURE_BOX_PADDING = 8f`, image redimensionnée avec préservation de ratio (`Math.min`), centrage horizontal
- Tests PDF : nom + date dans le bloc, image embarquée, null safety
- Modèles `CraPdfProviderSignature` et `CraPdfClientSignature` cohérents, structure client prête pour l'alignement futur

---

## Problèmes détectés

### BLOQUANT 1 — Le nom du prestataire ne s'affiche jamais dans l'UI

**Fichiers**: `frontend/src/api/types.ts`, `frontend/src/App.tsx`

Le backend (`CraDetailsDto.java`) retourne correctement `providerFirstName` et `providerLastName` via le mapper Java. Mais:

1. `frontend/src/api/types.ts` — l'interface `CraDetailsDto` **ne déclare pas** ces champs
2. `frontend/src/App.tsx` — `dtoToDetails()` **ne les mappe pas** vers `CraDetails`

Résultat : `cra.providerFirstName` et `cra.providerLastName` sont toujours `undefined` dans le state React. Le composant ne rend jamais le `<span className="provider-signature-box__name">`.

**Correction requise** :
```typescript
// api/types.ts — ajouter à CraDetailsDto :
providerFirstName?: string | null;
providerLastName?: string | null;

// App.tsx — ajouter dans dtoToDetails() :
providerFirstName: dto.providerFirstName ?? null,
providerLastName: dto.providerLastName ?? null,
```

---

### BLOQUANT 2 — `providerSignatureImageUrl` n'existe pas dans l'API backend

**Fichiers**: `frontend/src/api/types.ts`, `backend/src/main/java/com/timizerlike/backend/cra/dto/CraDetailsDto.java`

`frontend/src/api/types.ts` déclare `providerSignatureImageUrl?: string | null` et le mapper `dtoToDetails` l'utilise, mais le backend ne retourne jamais ce champ. `CraDetailsDto.java` ne contient aucune référence à `providerSignatureImageUrl`, ni le mapper Java `CraDetailsMapper.toDto()`.

Résultat : `cra.providerSignatureImageUrl` est toujours `null` — l'image de signature ne s'affiche jamais dans l'UI.

Le ticket exige explicitement : *"a preview of the stored or captured signature"* et *"The signed state displays the signature, signer name, and signing date"*.

**Correction requise** : Soit ajouter `providerSignatureImageUrl` au `CraDetailsDto.java` backend et le populer depuis le domaine, soit documenter explicitement que cette feature sera implémentée dans un ticket ultérieur (mais dans ce cas, la condition d'acceptance est non remplie).

---

### Mineur — Définition morte et confuse de `CraDetailsDto` dans `cra.ts`

**Fichier**: `frontend/src/types/cra.ts` lignes 27-36

`cra.ts` redéfinit localement une interface `CraDetailsDto` (qui étend `CraSummaryDto` et contient les champs nom prestataire) différente de celle de `api/types.ts`. Cette interface n'est importée par personne (`App.tsx` importe depuis `api/types.ts`). C'est du code mort qui génère confusion et risque de divergence silencieuse.

**Correction requise** : Supprimer la définition de `CraDetailsDto` dans `cra.ts`. Si des champs supplémentaires sont nécessaires dans le type domaine `CraDetails`, les ajouter uniquement là.

---

### Mineur — Handler `onSignClick` fragile (DOM query)

**Fichier**: `frontend/src/App.tsx` ligne 64

```typescript
const btn = craValidationRef.current?.querySelector<HTMLButtonElement>('.cra-validation__button');
btn?.click();
```

Cette approche contourne React et crée un couplage sur le CSS class name interne de `CraValidation`. Si le bouton n'est pas encore rendu (CRA null, loading), le click est silencieusement ignoré — ce qui est probablement acceptable ici. Pas bloquant mais fragile.

---

## Risques éventuels

- L'absence du nom du prestataire dans l'UI (bloquant 1) affecte la lisibilité du document signé et la confiance de l'utilisateur dans l'outil
- L'absence de l'image de signature dans l'UI (bloquant 2) rend le composant UI partiellement vide — un CRA "signé" n'affiche que la date
- Le PDF fonctionne indépendamment (il utilise `CraPdfProviderSignature` qui est alimenté ailleurs dans la stack), ce qui crée une asymétrie UI/PDF

---

## Décision

- REQUEST_CHANGES

## Actions demandées

1. **[BLOQUANT]** Ajouter `providerFirstName` et `providerLastName` (et optionnellement `providerCompany`) à `CraDetailsDto` dans `api/types.ts`, et les mapper dans `dtoToDetails()` (`App.tsx`)
2. **[BLOQUANT]** Clarifier et implémenter le canal de `providerSignatureImageUrl` : soit l'ajouter au backend `CraDetailsDto.java` avec sa source de données, soit retirer le champ du frontend et le tracker dans un ticket séparé
3. **[MINEUR]** Supprimer l'interface `CraDetailsDto` redondante dans `cra.ts`

---

IMPLEMENTATION_FIX_REQUIRED
