---

# PR Review — T032: Allow frontend access from Tailscale and local network

## Résumé

L'implémentation configure le serveur Vite pour écouter sur toutes les interfaces réseau (`0.0.0.0`) avec un port fixe (`5173`) et mode strict (`strictPort: true`). Trois fichiers modifiés : `frontend/vite.config.ts`, `frontend/README.md`, `docs/local-development.md`. Aucune dépendance ajoutée, aucun changement backend, aucun secret exposé.

## Vérifications effectuées

- `frontend/vite.config.ts` — configuration serveur
- `frontend/README.md` — section remote access
- `docs/local-development.md` — section 5 frontend startup
- `frontend/package.json` — scripts inchangés
- Périmètre des commits depuis le fork de la branche principale

## Points validés

| Critère d'acceptance | Statut | Élément vérifié |
|---|---|---|
| Dev server écoute hors localhost | ✅ | `host: '0.0.0.0'` — vite.config.ts:7 |
| Accessible localement sur `http://localhost:5173` | ✅ | Comportement Vite standard avec 0.0.0.0 |
| Accessible depuis `http://<IP>:5173` sur LAN/Tailscale | ✅ | Config + documentation |
| Port explicitement configuré | ✅ | `port: 5173` — vite.config.ts:8 |
| Commande de dev inchangée (`npm run dev`) | ✅ | package.json non modifié |
| Échec clair si port occupé | ✅ | `strictPort: true` — vite.config.ts:9 |
| README documente l'accès Tailscale / LAN | ✅ | Section "Remote access" — frontend/README.md:18 |
| Build et tests frontend non impactés | ✅ | Config de test inchangée, pas de nouvelles dépendances |

**Sécurité** : usage `0.0.0.0` documenté comme réseau de confiance, avertissement pare-feu présent dans les deux docs, aucun secret, aucune exposition Internet.

**Scope** : strictement borné au frontend Vite. Backend non touché.

## Problèmes détectés

Aucun problème bloquant.

**Observations mineures (non bloquantes)** :

1. `docs/local-development.md:93` ne propose que `ifconfig`, alors que `frontend/README.md:30–33` donne aussi `ip addr show` — légère asymétrie entre les deux docs.
2. Renommage `REACT_APP_API_BASE_URL` → `VITE_API_BASE_URL` en `docs/local-development.md:101` — correction d'une erreur pré-existante, bénigne mais techniquement hors scope.

## Risques éventuels

L'exposition `0.0.0.0` dépend du pare-feu OS hôte — risque documenté dans les deux fichiers, acceptable pour un dev server sur réseau de confiance.

## Décision

APPROVED — tous les critères d'acceptance satisfaits, scope respecté, aucun problème bloquant.

## Actions demandées

Aucune.

---

IMPLEMENTATION_APPROVED
