Now I have all the information I need. Let me write the review.

---

# PR Review — T078: Replace provider profile fields and include them in CRA PDFs

## Résumé

L'implémentation couvre l'intégralité du périmètre défini par le ticket et le plan. Les six champs légaux prestataire (raisonSociale, SIRET, adresse, codePostal, ville, pays) sont correctement modélisés, exposés via l'API, éditables depuis Settings, snapshotés dans les CRAs et rendus dans les PDFs. Le scope est respecté : aucun refactor transversal hors ticket.

## Vérifications effectuées

- Entités et DTOs backend (ProviderSettings, MonthlyCraReport, CraDetailsDto, CraDetailsMapper)
- Service de création CRA (MonthlyCraCreationService) : mapping des nouveaux champs prestataire
- Service de génération PDF (CraPdfDownloadService, CraPdfGenerator) : formatage adresse, wrapping texte, rendu bloc prestataire
- Formulaire Settings (ProviderSettingsForm.tsx) : validation, état sauvegardé, cancel
- Types frontend (api/types.ts, types/cra.ts) : suppression anciens champs provider, ajout nouveaux
- Stratégie de migration (ddl-auto: update, colonnes nullable)
- Absence de références aux anciens champs provider dans tout le codebase source

## Points validés

**Backend**
- `ProviderSettings.java` : 6 champs corrects, `@NotBlank` sur raisonSociale, `@Pattern(regexp = "^\\d{14}$")` sur siret (nullable, conforme à la spec Jakarta — null accepté, chaîne vide rejetée)
- `MonthlyCraReport.java` : anciens champs (providerFirstName, providerLastName, providerEmail, providerPhone) supprimés ; 6 nouveaux champs snapshotés, tous nullable (migration safe)
- `CraDetailsMapper.java` : mapping correct vers les 6 nouveaux champs
- `CraPdfDownloadService.java` : `formatProviderAddress()` gère correctement les parties null/blank sans séparateurs orphelins ; fallback `providerRaisonSociale` si `providerSignerName` est null
- `CraPdfGenerator.java` : `drawWrappedOptionalLine()` et `wrapText()` implémentés correctement, wrapping dans les marges A4 ; affichage conditionnel SIRET ("SIRET : " + siret) ; company et contact supprimés du bloc prestataire
- `MonthlyCraCreationService.java` : récupère le ProviderSettings et mappe les 6 champs ; injection ProviderSettingsService correcte
- Aucune référence à providerFirstName/Last/Email/Phone dans les sources backend ou frontend

**Frontend**
- `ProviderSettingsForm.tsx` : 6 inputs corrects, chargement au montage, annulation restaure savedValues, conversion empty→null dans `valuesToDto()`, SIRET validé `/^\d{14}$/` côté client
- `api/types.ts` : `ProviderSettingsDto` et `CraDetailsDto` mis à jour ; anciens champs provider supprimés
- Accessibilité : aria-invalid, aria-describedby, role="alert", role="status" en place

## Problèmes détectés

### Risque migration : colonnes NOT NULL unmappées pouvant casser la création de CRA sur DB existante

**Sévérité : Modéré (affecte uniquement les installations existantes)**

**Analyse :** Dans le schema généré par l'ancienne version, `monthly_cra_report` avait `provider_first_name NOT NULL`, `provider_last_name NOT NULL`, `provider_company NOT NULL`. Avec `ddl-auto: update`, Hibernate ajoute les nouvelles colonnes mais ne touche pas ces anciennes. Lorsqu'un nouveau CRA est inséré, Hibernate génère un INSERT qui n'inclut pas ces colonnes. SQLite (sans mode STRICT) respecte `NOT NULL` et retournerait `NOT NULL constraint failed` à la première création de CRA sur une DB existante.

**Ce que le plan dit :** Le plan mentionne que les anciennes colonnes restent unmappées ("safe"), mais ne traite pas explicitement le cas NOT NULL + nouvelles insertions.

**Impact :** Installations fraîches : aucun problème (table créée ex nihilo avec le nouveau schéma). Installations existantes avec des données : la première `createForMonth()` après mise à jour échouerait.

**Correctif possible :** Exécuter avant le démarrage :
```sql
ALTER TABLE monthly_cra_report ALTER COLUMN provider_first_name DROP NOT NULL;
ALTER TABLE monthly_cra_report ALTER COLUMN provider_last_name DROP NOT NULL;
ALTER TABLE monthly_cra_report ALTER COLUMN provider_company DROP NOT NULL;
```
Ou (SQLite ne supportant pas DROP NOT NULL) : recréer la table via un script de migration manuel.

**Contexte atténuant :** Le ticket cible visiblement une application en phase précoce. Les tests de persistance (`MonthlyCraReportPersistenceTest`) utilisent `ddl-auto=create-drop` sur la vraie DB, ce qui valide le schéma new mais pas le scénario upgrade.

## Risques éventuels

- **PDFBox / encodage non-Latin1 :** `PDType1Font` (Helvetica) lève `IllegalArgumentException` pour les caractères hors WinAnsiEncoding. Si une raison sociale ou adresse contient des caractères hors Latin-1 (rares en contexte français, mais possibles), la génération PDF échouerait. Risque pré-existant au ticket, non introduit ici.
- **SIRET vide via API directe :** Si un client API soumet `siret: ""`, le `@Pattern` rejette avec 400. Le frontend convertit correctement en null. Risque acceptable pour une API interne.

## Décision

L'implémentation est correcte, complète et conforme au ticket. Tous les critères d'acceptation sont satisfaits pour les installations fraîches. Le risque migration NOT NULL sur installations existantes est notable mais pas bloquant compte tenu du contexte applicatif ; il doit être documenté pour toute procédure de mise à jour.

- **APPROVED** (avec note de risque migration pour installations existantes)

---

IMPLEMENTATION_APPROVED
