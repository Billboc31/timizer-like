# Test Report — T069: Add persistent navigation back to the home page

## Méthode

Validation par lecture statique du code implémenté. Le projet étant une SPA React sans backend requis pour la navigation, l'ensemble des critères peut être vérifié par analyse du code source. Les fichiers analysés :

- `frontend/src/components/AppSidebar/AppSidebar.tsx`
- `frontend/src/components/AppShell/AppShell.tsx`
- `frontend/src/components/AppSidebar/AppSidebar.css`
- `frontend/src/components/AppShell/AppShell.css`
- `frontend/src/App.tsx`

---

## Critères d'acceptation

### 1. Every authenticated screen provides a visible route back to the home page

**PASS**

`AppShell` enveloppe l'intégralité de l'application (`App.tsx` ligne 176). Il rend toujours `AppSidebar` — visible en permanence sur desktop — et un topbar mobile contenant le bouton brand. Aucun écran authentifié n'échappe à cet enveloppement.

---

### 2. Clicking `Accueil` opens the annual calendar dashboard

**PASS**

`AppSidebar.tsx` ligne 96–100 : le bouton "🏠 Accueil" appelle `handleNavClick('overview')`, qui appelle `onNavigate('overview')`. L'intercepteur dans `AppShell.tsx` (ligne 40) laisse passer `'overview'` vers `onNavigate` sans déclencher `onNewCra`. Dans `App.tsx`, `view === 'overview'` rend `<AnnualCalendar ...>` (ligne 198).

---

### 3. Clicking the application logo also returns home when the logo is displayed as navigation

**PASS**

- Sidebar (desktop + mobile) : `<button onClick={() => handleNavClick('overview')}>` (`AppSidebar.tsx` ligne 86–90)
- Topbar mobile : `<button onClick={() => { onNavigate('overview'); setSidebarOpen(false); }}>` (`AppShell.tsx` ligne 55–59)

Les deux emplacements naviguent vers `'overview'`.

---

### 4. The active navigation state is correct on the home route

**PASS**

`AppSidebar.tsx` ligne 96 : `aria-current={activeView === 'overview' ? 'page' : undefined}`.  
`AppSidebar.css` ligne 76–80 : la règle `.app-sidebar__nav-item[aria-current='page']` applique le style actif (border-left + bold).  
Sur la vue `'history-detail'`, `shellView = 'history'` (`App.tsx` ligne 173) — "Accueil" n'est pas mis en évidence, ce qui est correct.

---

### 5. Returning home does not modify or create CRA data

**PASS**

`setView('overview')` modifie uniquement l'état de la vue. Aucune variable d'état CRA n'est réinitialisée ou modifiée. L'intercepteur `AppShell.tsx` ligne 40 réserve `onNewCra()` au seul cas `view === 'selector'` ; `'overview'` appelle `onNavigate(view)` uniquement.

---

### 6. The link is keyboard accessible and has an accessible label

**PASS**

- Bouton "Accueil" : `<button>🏠 Accueil</button>` — le contenu textuel "Accueil" sert de nom accessible.
- Brand sidebar : `aria-label="Retour à l'accueil"`.
- Brand topbar mobile : `aria-label="Retour à l'accueil"`.
- Tous sont des `<button>` natifs → focus clavier et activation Enter/Space natifs.
- `:focus-visible` défini sur les trois éléments.

---

### 7. Desktop and mobile navigation both expose the action

**PASS**

- Desktop : sidebar toujours affichée avec bouton "Accueil" et bouton brand.
- Mobile : topbar sticky avec bouton brand, plus sidebar (ouverte via hamburger) avec bouton "Accueil" et bouton brand.

---

## Régressions

Aucune régression détectée.

- Les items existants (History, Paramètres, New CRA) conservent leur comportement et leur `aria-current` inchangés.
- La gestion du focus (retour sur le hamburger à la fermeture de la sidebar, focus trap en mode dialog) est intacte.
- L'intercepteur `'selector' → onNewCra()` dans `AppShell` est inchangé.

---

## Observations non-bloquantes

1. **Navigation basée sur l'état, sans URL** : le ticket demande que "browser back/forward navigation remains consistent". L'application utilise déjà une navigation 100 % état-React sans synchronisation avec `window.history`. Ce comportement est inchangé — cohérent avec l'existant, mais le bouton retour navigateur ne peut pas revenir à un écran précédent depuis l'accueil. Ce n'est pas une régression introduite par T069.

2. **Emoji 🏠** : peut avoir un rendu variable selon les plateformes. Acceptable d'après le plan.

---

## Décision

**VALIDATION RÉUSSIE** — les 7 critères d'acceptation sont remplis, aucun problème bloquant identifié.

TESTS_PASSED
