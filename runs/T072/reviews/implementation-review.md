I now have everything I need to write the review. All four blocking fixes from round 1 have been verified in the actual source files.

---

# PR Review — T072 · Open CRA details in a shared modal (round 2)

## Résumé

Les deux problèmes bloquants identifiés en review 1 ont été corrigés, ainsi que les deux points mineurs optionnels. L'implémentation est complète, cohérente avec le plan, et tous les critères d'acceptance du ticket sont couverts.

---

## Vérifications effectuées

- Lecture de `CraDetailModal.tsx` (correction `fetchCancelledRef` dans `handleRetry`)
- Lecture de `App.tsx` (correction deep-link `parseInt` + `isNaN`)
- Lecture de `App.test.tsx` (nouveaux tests browser back et focus restoration)
- Lecture de `CraDetailModal.test.tsx` (couverture existante)
- Croisement avec les actions demandées en review 1

---

## Points validés

**Corrections des bloquants**

- **Bloquant 1 (test browser back)** — Résolu. `App.test.tsx` contient le test `"browser back (popstate) closes the modal without leaving the originating view"` : ouvre la modal depuis History, simule `replaceState(null) + dispatchEvent(new PopStateEvent('popstate'))`, vérifie que le `<dialog>` n'est plus ouvert et que la liste History reste montée. ✅

- **Bloquant 2 (test focus restoration)** — Résolu. `App.test.tsx` contient le test `"focus returns to the trigger element after closing the modal"` : stocke la référence au bouton trigger, ouvre la modal, la ferme via ×, vérifie `document.activeElement === triggerButton`. ✅

**Corrections des mineurs optionnels**

- **Mineur 1 (`handleRetry` sans annulation)** — Résolu. `CraDetailModal.tsx` introduit `fetchCancelledRef` (l. 73). Il est mis à `false` en début de `useEffect` et de `handleRetry`, à `true` dans le cleanup de l'effet. Les callbacks `then`/`catch` de `handleRetry` vérifient `fetchCancelledRef.current` avant tout `setState`. ✅

- **Mineur 2 (deep-link malformé)** — Résolu. `App.tsx` utilise désormais `parseInt(id, 10)` avec garde `isNaN(n) ? null : n` (l. 46-51). ✅

**Points inchangés et toujours valides**

- `<dialog>` natif, `showModal()` / `close()`, cohérent avec `NewCraDialog`.
- `aria-modal`, `aria-labelledby`, label `"Fermer"`, focus trap Tab/Shift+Tab.
- Scroll lock avec cleanup correct.
- Fermeture × / Escape (`onCancel`) / backdrop click / popstate.
- Header et actions sticky, body scrollable interne.
- Breakpoint ≤640px → full-screen drawer.
- `pushState` à l'ouverture, `modalPushedState.current` pour éviter double `history.back()`.
- `'history-detail'` retiré de `AppView` dans `AppShell.tsx`.
- Aucune navigation précédent/suivant dans la modal.
- 300 tests passent.

**Mineur 3 — `dtoToCraDetails` dupliqué** : dette technique correctement laissée hors scope de ce ticket. Pas de régression introduite. ✅

---

## Risques résiduels

Aucun risque bloquant résiduel. Les risques mineurs signalés en review 1 restent connus et acceptés :

- Capture du focus via `document.activeElement` au clic souris : peut cibler `body` sur éléments non focusables. Sans conséquence fonctionnelle.
- `TITLE_ID` constant partagé : sans impact tant qu'une seule instance est montée (garanti par `App.tsx`).

---

## Décision

Tous les bloquants sont levés. Les mineurs optionnels ont également été traités. L'implémentation respecte le plan, le ticket, les conventions d'architecture et les critères d'acceptance.

IMPLEMENTATION_APPROVED
