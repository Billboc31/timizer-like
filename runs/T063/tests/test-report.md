---

# Test Report — T063

## Résultat : PASS

Suite de tests : **278/278 verts** (`vitest run`)

### Critères d'acceptation

| # | Critère | Statut |
|---|---------|--------|
| 1 | Top navigation remplacée par sidebar gauche sur desktop | **PASS** |
| 2 | Toutes les actions de navigation restent disponibles | **PASS** |
| 3 | Page courante visuellement identifiable | **PASS** |
| 4 | Action New CRA disponible depuis la sidebar | **PASS** |
| 5 | Layout fonctionnel desktop / tablette / mobile | **PASS** |
| 6 | Navigation clavier complète | **PASS** |
| 7 | Routes et deep links préservés | **PASS** |

### Détail clé par critère

- **Sidebar desktop** : `flex-direction: row` + sidebar 220 px fixe, contenu principal `flex: 1; min-width: 0; overflow-y: auto` — aucun chevauchement possible.
- **Active state** : `aria-current="page"` + `border-left` accent CSS sur nav-items, `background-color: primary-dark` sur New CRA.
- **Mobile** : tiroir 280 px en `position: fixed`, transition 0.25s, backdrop, breakpoint JS synchronisé avec le CSS à 767 px.
- **Accessibilité clavier** : piège de focus Tab/Shift-Tab, Escape ferme, `inert` bloque la sidebar fermée côté mobile, focus retourné au hamburger via `useRef` + `useEffect` sur `sidebarOpen`.
- **Pas de régression** : `App.tsx` inchangé, 278 tests verts.

### Observations non bloquantes

- `handleNavClick` appelle `onClose()` même sur desktop (idempotent, sans effet).
- `aria-label` du hamburger ne reflète pas l'état ouvert/fermé (`aria-expanded` le fait — valide APG).

**Rapport écrit dans** `runs/T063/test-report.md`.
