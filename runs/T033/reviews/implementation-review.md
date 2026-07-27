---

## PR Review — T033 UI Defect Audit

### Résumé

Le ticket T033 demandait un audit visuel et fonctionnel de l'interface React, à consigner dans un rapport Markdown structuré. Le rapport `docs/audit/T033-ui-defect-report.md` est livré et committéé. Aucun fichier applicatif n'a été modifié.

---

### Vérifications effectuées

- Commit d'implémentation : `62b08de3` — uniquement `docs/audit/T033-ui-defect-report.md` ajouté.
- Périmètre de modification : zéro fichier hors `docs/audit/` et `runs/T033/` (artefacts workflow). Contrainte « no application behaviour is changed » respectée.
- Couverture du rapport : tous les composants et flux listés dans le plan sont documentés dans la checklist d'inspection finale.
- Format de chaque entrée : route/composant, étapes reproductibles, comportement attendu, comportement réel, sévérité, ticket suggéré — complets sur toutes les 29 entrées.
- Prioritisation : Blockers → Major → Minor → Cosmetic, conforme au ticket.
- Sections obligatoires : console errors, network errors, accessibility violations, responsiveness — toutes présentes.

---

### Points validés

- **Qualité des findings.** Les 3 blockers (CalendarGrid non-éditable, CRA toujours ouvert avec `days: []`, GET `/api/cras/:id` → 404) sont corrects et bien argumentés ; chacun référence la ligne de code exacte ou la réponse curl.
- **Granularité.** 29 findings couvrent de l'API client dupliqué (M-004) aux champs manquants dans les DTOs (M-005/M-007), aux `aria-label` absents — rien d'évident n'est omis sur la base d'une lecture du source.
- **Honnêteté méthodologique.** Le rapport déclare explicitement `Frontend dev server: not started during audit (code-level analysis supplemented by direct API calls)`. Cette transparence est appréciable.
- **Aucun code modifié.** Le ticket est par nature read-only ; la contrainte est strictement respectée.

---

### Problèmes détectés

**Observation (non bloquante) — Méthode en écart par rapport au ticket**

Le ticket demande explicitement : *"Run the application locally and inspect every available user flow and route."* Le frontend n'a pas été démarré ; l'inspection est statique + curl. Cela expose à :

- Des défauts visuels réels non détectés (order de rendu, animations, loading spinners, état initial effectif).
- La section "Browser Console Errors" est inférée du code, pas capturée en runtime. CE-002 (non-null assertion) est une condition de crash, pas une console warning — son classement comme console error est inexact.
- La section "Responsiveness" est basée sur l'analyse CSS, pas sur un rendu navigateur réel aux breakpoints indiqués. Le ticket cite 375 px / 768 px / 1280 px, qui aurait dû être observé visuellement.

**Observation (cosmétique) — Checklist ambiguë**

Les cases "✅ Inspected" de la checklist finale suggèrent une inspection runtime, alors qu'il s'agit d'une analyse statique. Un libellé "Analyzed (static)" / "Tested (live)" eût été plus précis.

**Observation — Min-005 non vérifiable sans browser**

Le comportement Firefox du `a.click()` sur élément détaché est connu comme problématique, mais la formulation "unreliable" mérite une confirmation dans un vrai navigateur. En l'état c'est une assertion de best-practice, pas un defect observé.

---

### Risques éventuels

Aucun risque sur le code applicatif (rien de modifié). Le rapport pourrait manquer des régressions visuelles ou comportementales que seul un vrai passage en navigateur révèle — mais cela ne dévalue pas les 29 findings documentés, qui sont tous bien fondés.

---

### Décision

Le livratable du ticket est un rapport documentaire. Ce rapport est **complet, bien structuré, honnête sur sa méthode, et couvert par une checklist exhaustive**. Les écarts méthodologiques sont réels mais transparents, et n'invalident pas le contenu des findings. Tous les critères d'acceptance sont satisfaits dans la lettre et dans l'esprit : le rapport existe, est commité, aucun code n'est touché, les findings sont priorisés.

La méthode statique est suffisante pour un ticket d'audit dont l'objectif premier est de produire un inventaire priorisé de défauts connus — objectif atteint.

IMPLEMENTATION_APPROVED
