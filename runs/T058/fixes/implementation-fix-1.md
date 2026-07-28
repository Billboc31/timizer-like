# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T058/reviews/implementation-review.md
- generated at: 2026-07-28T10:49:52Z

---

---

# PR Review — T058

## Résumé

La structure est solide : composant `ProviderSignatureBox` bien architecturé (états vide/signé, tokens BEM, accessibilité, responsive), bloc PDF rectangulaire avec padding, câblage dans `App.tsx`. Mais **la fonctionnalité centrale — l'affichage de l'image de signature — est absente à la fois de l'UI et du PDF**, ce qui viole directement le plan et les critères d'acceptance.

---

## Points validés

- Rectangle bordered (dashed vide / solid signé), `min-height: 120px`, tokens CSS sans couleur hardcodée
- Accessibilité complète : `role="button"`, `tabIndex`, `aria-label`, Enter/Space, focus ring
- Nom prestataire et date formatée `dd/MM/yyyy` en état signé
- Responsive `480px` : box pleine largeur, footer en colonne
- `App.tsx` : `onSignClick` câblé correctement, `CraValidation.tsx` non modifié
- PDF : constante `SIGNATURE_BOX_PADDING`, rectangle dessiné avant le contenu, nom et date avec padding respecté
- Bloc client signature placeholder avec dimensions identiques
- Aucune modification des modèles ou services backend

---

## Problèmes bloquants

### 1 — Image de signature absente du composant frontend

**Plan ligne 14** : état signé = rectangle contenant un `<img>` avec `object-fit: contain` et padding interne.  
**Plan ligne 22** : classe `.provider-signature-box__img` requise.  
**Critère ligne 61** : *"the same rectangle renders in solid-border style containing the stored signature image".*

**Constat** : `ProviderSignatureBox.tsx:40-51` — aucun `<img>`. La classe `.provider-signature-box__img` n'existe pas dans le CSS. Aucun champ `providerSignatureImageUrl` dans `CraDetails`/`CraDetailsDto` (`frontend/src/types/cra.ts`).

**Corrections requises** :
- Ajouter `providerSignatureImageUrl?: string | null` dans `CraDetails` et `CraDetailsDto`
- Ajouter `<img src={cra.providerSignatureImageUrl} alt={...} className="provider-signature-box__img" />` dans l'état signé (conditionnel si URL présente)
- Ajouter `.provider-signature-box__img { max-width: 100%; object-fit: contain; display: block; margin: 0 auto; }` dans le CSS

---

### 2 — Image de signature absente du PDF

**Plan ligne 39** : image scalée avec `PDImageXObject`, ratio préservé, rendue à l'intérieur de la boîte.  
**Critère ligne 65** : *"signature image (when present) is scaled to fit without crossing any border".*

**Constat** : `CraPdfGenerator.java:160-162` — la référence est rendue comme texte littéral `[sig-ref-123]`, pas comme image. Aucun import `PDImageXObject`, aucune logique de chargement ou mise à l'échelle.

**Correction requise** : charger via `PDImageXObject`, calculer les dimensions disponibles (`SIGNATURE_BOX_WIDTH - 2×padding` × hauteur restante), dessiner l'image avec `cs.drawImage()`, positionner nom/date en-dessous.

---

### 3 — Tests manquants : image dans l'état signé

**Plan ligne 31** : *"Signed-state test: renders the `<img>`, signer name, and formatted date; image has `alt` attribute set".*

**Constat** : `ProviderSignatureBox.test.tsx` — aucune assertion sur `<img>`, `src`, ou `alt`.

**Correction requise** : ajouter `providerSignatureImageUrl` dans `SIGNED_CRA`, tester `getByRole('img')` avec src et alt corrects, tester l'absence d'image quand l'URL est null.

---

## Risques éventuels

- La source de `signatureImageRef` (S3, base de données, chemin fichier) n'est pas documentée. Si le backend n'expose pas encore d'URL accessible depuis le frontend, une résolution complémentaire sera nécessaire. À clarifier avant de livrer la correction.

---

## Décision

IMPLEMENTATION_FIX_REQUIRED
