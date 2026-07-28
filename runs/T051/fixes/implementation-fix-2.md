# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T051/reviews/implementation-review.md
- generated at: 2026-07-28T17:21:25Z

---

---

# PR Review — T051: Add provider signature capture and reusable signature settings

## Résumé

Implémentation complète et bien structurée. Tous les critères d'acceptation du ticket sont couverts. Les deux blocages des reviews précédentes (`@Valid` manquant + tests HTTP manquants) ont été corrigés. Deux nouveaux défauts ont été identifiés.

## Points validés

- Dessin pointer events (mouse + touch) avec `setPointerCapture` ✓
- Upload avec validation MIME + taille aux deux couches ✓
- Preview / remplacement / suppression ✓
- Snapshot immutable sur CRA (`MonthlyCraReport` stocke directement image + nom) ✓
- Blocage CRA si pas de signature configurée (404 → message settings) ✓
- Intégration PDF (`signatureImageRef` propagé) ✓
- 129 tests backend + ~26 tests frontend spécifiques ✓

## Problèmes bloquants

### [1] `<dialog>` sans `onCancel` — bug accessibilité clavier

**`CraValidation.tsx` ligne 151** : la touche Escape ferme le dialog nativement (via l'événement `cancel` du navigateur) sans passer par React. `uiState` reste à `'confirming'`, le `useEffect` de focus ne se déclenche pas, et le focus clavier est perdu.

**Correction :** ajouter `onCancel={handleCancel}` sur l'élément `<dialog>`. `handleCancel` existe déjà et gère correctement le retour à `'idle'`.

### [2] `setTimeout` sans cleanup — risque sur unmount

**`CraValidation.tsx` ligne 77** : le timer de 2s n'est pas annulé si le composant est démonté. En React strict mode, le callback s'exécute quand même. Stocker l'id dans une `ref` et appeler `clearTimeout` dans un effet de cleanup.

Un test simulant `fireEvent(dialog, new Event('cancel'))` doit accompagner la correction du point 1.

## Décision

IMPLEMENTATION_FIX_REQUIRED
