# PR Review — T032: Allow frontend access from Tailscale and local network

## Résumé

L'implémentation configure le serveur Vite pour écouter sur toutes les interfaces
réseau (`0.0.0.0`) avec un port fixe (`5173`) et un mode strict (`strictPort: true`).
Trois fichiers sont modifiés : `frontend/vite.config.ts`, `frontend/README.md`,
`docs/local-development.md`. Aucune dépendance ajoutée, aucun changement backend,
aucun secret exposé. Tous les critères d'acceptance sont couverts.

## Vérifications effectuées

- Lecture de `frontend/vite.config.ts` — configuration serveur vérifiée
- Lecture de `frontend/README.md` — section remote access vérifiée
- Lecture de `docs/local-development.md` — section 5 frontend startup vérifiée
- Lecture de `frontend/package.json` — scripts inchangés, `npm run dev` intact
- Vérification du périmètre des commits depuis le fork de la branche principale

## Points validés

| Critère d'acceptance | Statut | Élément vérifié |
|---|---|---|
| Dev server écoute hors localhost | ✅ | `host: '0.0.0.0'` dans vite.config.ts:7 |
| Accessible localement sur `http://localhost:5173` | ✅ | Comportement Vite standard avec 0.0.0.0 |
| Accessible depuis `http://<IP>:5173` sur LAN/Tailscale | ✅ | Config + documentation |
| Port explicitement configuré | ✅ | `port: 5173` dans vite.config.ts:8 |
| Commande de dev inchangée (`npm run dev`) | ✅ | package.json non modifié |
| Échec clair si port occupé | ✅ | `strictPort: true` dans vite.config.ts:9 |
| README documente l'accès Tailscale / LAN | ✅ | Section "Remote access" dans frontend/README.md:18 |
| Build et tests frontend non impactés | ✅ | Configuration de test inchangée, pas de nouvelles dépendances |

**Qualité du code** : changement minimal, lisible, sans magie cachée.

**Sécurité** : `0.0.0.0` est explicitement documenté comme usage réseau de confiance.
Aucun secret hardcodé. Aucune exposition Internet. Avertissement pare-feu présent
dans les deux documents.

**Scope** : strictement borné au frontend Vite. Backend non touché, production
non concernée, tout ce qui est hors scope dans le ticket est effectivement absent.

## Problèmes détectés

Aucun problème bloquant.

### Observations mineures (non bloquantes)

1. **Commande LAN incomplète dans docs/local-development.md** — La section 5
   (`docs/local-development.md:93`) ne propose que `ifconfig | grep 'inet ' | grep -v 127`,
   tandis que `frontend/README.md:30–33` donne aussi l'alternative `ip addr show`.
   Légère asymétrie entre les deux documents. Non bloquant.

2. **Renommage `REACT_APP_API_BASE_URL` → `VITE_API_BASE_URL`** dans
   `docs/local-development.md:101` — Correction d'une erreur pré-existante dans
   la documentation (CRA vs Vite). Techniquement hors scope du ticket mais exacte
   et bénigne. Non bloquant.

## Risques éventuels

- L'exposition sur `0.0.0.0` dépend du pare-feu OS hôte pour limiter l'accès.
  Ce risque est documenté dans les deux fichiers mis à jour. Acceptable pour un
  serveur de développement sur réseau de confiance.
- Aucun risque de régression : aucune logique applicative modifiée.

## Décision

APPROVED — tous les critères d'acceptance sont satisfaits, le scope est respecté,
aucun problème bloquant identifié.

## Actions demandées

Aucune. Les deux observations mineures sont des améliorations optionnelles
et ne nécessitent pas de correction avant merge.
