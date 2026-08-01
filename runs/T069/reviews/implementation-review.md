React 19 is confirmed, so the `inert` boolean prop is fully supported. I have everything I need for the review.

---

# PR Review — T069: Add persistent navigation back to the home page

## Résumé

L'implémentation ajoute un bouton "Accueil" dans la sidebar (`AppSidebar`), convertit la marque en bouton cliquable (sidebar + topbar mobile), et gère correctement l'état actif, le focus, et la fermeture du panneau mobile. Les quatre nouveaux fichiers (`AppShell.tsx`, `AppShell.css`, `AppSidebar.tsx`, `AppSidebar.css`) constituent l'architecture de navigation du ticket. `App.tsx` les intègre comme conteneur racine.

## Vérifications effectuées

- Lecture du plan (`runs/T069/plan.md`)
- Diff complet des 4 fichiers composants vs base `ai-dev-factory/bootstrap-agent-layout`
- Lecture de `App.tsx` pour vérifier le câblage
- Vérification de la version React (`react@19.2.7`) pour valider la prop `inert`

## Points validés

| Critère ticket | Statut | Détail |
|---|---|---|
| Navigation persistante "Accueil" | ✅ | Bouton dans `<nav>` de la sidebar, toujours visible |
| Label français + icône | ✅ | `🏠 Accueil` dans la sidebar |
| Logo navigue vers home | ✅ | Brand sidebar + brand topbar mobile, `aria-label="Retour à l'accueil"` |
| Visible depuis tous les écrans | ✅ | `AppShell` enveloppe l'intégralité de l'app |
| Mise en évidence route active | ✅ | `aria-current="page"` + `border-left` CSS sur `.app-sidebar__nav-item[aria-current='page']` |
| Pas de création CRA | ✅ | `onNavigate('overview')` → `setView('overview')` uniquement. L'intercepteur `view === 'selector' ? onNewCra() : onNavigate(view)` est correct |
| Navigation clavier | ✅ | Tous les éléments sont des `<button>`, `focus-visible` défini, focus trap complet en mode dialog |
| Mobile | ✅ | Sidebar en `role="dialog"` + backdrop + brand dans le topbar |
| `inert` boolean | ✅ | React 19 — support natif du prop booléen `inert` |
| Focus retour hamburger | ✅ | `useEffect` sur `sidebarOpen` refocus `hamburgerRef` à la fermeture |
| `aria-expanded` / `aria-controls` sur hamburger | ✅ | Pattern disclosure ARIA correct |

## Problèmes détectés

Aucun problème bloquant.

**Observations mineures (non-bloquant) :**

1. **Labels non traduits** (`New CRA`, `History`) — pré-existant, hors scope T069 qui demande uniquement `Accueil` en français.
2. **`aria-modal={isDialog || undefined}`** — `isDialog` est `boolean`, donc `boolean || undefined`. TypeScript accepte `boolean | undefined` pour `aria-modal` en React 19, mais le comportement de `false || undefined` produit `undefined` (attribut absent), ce qui est le comportement voulu. Correct.
3. **`handleNavClick` appelle `onClose()` même sur desktop** — sur desktop `onClose()` passe `sidebarOpen` à `false`, mais l'affichage ne dépend pas de cette valeur en CSS desktop. No-op visuel, acceptable.

## Risques éventuels

- Le focus trap utilise `document.addEventListener('keydown', ...)` sans capture phase. Si un composant enfant appelle `e.stopPropagation()` sur un événement clavier, l'Escape ne fermera pas la sidebar. Risque théorique faible dans l'état actuel du codebase.

## Décision

Toutes les acceptance criteria sont remplies. L'implémentation est propre, accessible et bornée au scope du ticket.

IMPLEMENTATION_APPROVED
