I've read the ticket, plan, code, tests, and prior review artifacts. The implementation is unchanged since attempt-1/attempt-2 (both APPROVED). Producing an independent third-pass review.

# PR Review — T016 (attempt 3)

## Résumé

Troisième passe de review sur `CraPdfGenerator` — POJO Java qui rend un `CraPdfDocument` (records T015) en un PDF A4 deux pages via Apache PDFBox 3.0.3. Aucun changement de code depuis les deux reviews précédentes (le diff est stable sur 4 fichiers : `backend/pom.xml`, `backend/README.md`, `backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java`, `backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java`). Vérification indépendante des critères d'acceptation, du scope, du layout, des tests et de la sécurité — conforme, aucun bloquant.

## Vérifications effectuées

- Relu `T016` (issue #16) et `runs/T016/plan.md`.
- `git diff --stat ai-dev-factory/bootstrap-agent-layout..HEAD` : seuls les 4 fichiers autorisés du plan sont modifiés côté `backend/*` (le reste est artefact runtime `runs/T016/*`).
- Croisement des imports `com.timizerlike.cra.pdf.model.*` (`CraPdfGenerator.java:3-10`) avec les arités attendues du modèle T015 : `CraPdfDocument(page1, page2Days, signatures)`, `CraPdfSummary(period, provider, client, totalWorkedDays)`, `CraPdfParty(name, company, address, contact)`, `CraPdfContact(name, email)`, `CraPdfProviderSignature(name, signedAt, signatureImageRef)`, `CraPdfSignatures(provider, client)`, `CraPdfDayEntry(date, dayOfWeek, type, workedFraction, comment)`, et les 5 valeurs de `CraPdfDayType`. Cohérent.
- APIs PDFBox 3.0.3 utilisées (`Loader.loadPDF`, `PDDocument#addPage`, `PDPageContentStream` + `beginText`/`newLineAtOffset`/`showText`, `addRect`/`stroke`, `Standard14Fonts.FontName.HELVETICA[_BOLD]`, `new PDType1Font(...)`, `PDFTextStripper`) — toutes valides sur 3.0.3.
- Retracé le layout page 1 en pt A4 (`PAGE_TOP=802`, marge basse 40) : titre 802 → période 780 → Prestataire (750→665) → Client (650→565) → Total (550→520) → Frais (495→465) → Signature prestataire (455 avec cadre bas à 347) → Signature client (327 avec cadre bas à 252). Tout tient au-dessus de 40pt.
- Retracé le layout page 2 : titre 802 → 777 → en-tête 777 → 31 lignes ×18pt = 558pt max sous en-tête. Marge respectée même sur mois plein.
- Contrôle AC :
  - `A two-page PDF` : deux `addPage` explicites → ✅.
  - `Page 1 contains summary information` : `Compte-Rendu d'Activité`, période `MM/yyyy`, blocs Prestataire/Client (name/company/address/contact), Total jours travaillés + valeur, placeholder Frais → ✅.
  - `Page 1 contains provider signature information` : label + name + `Signé le dd/MM/yyyy` + cadre placeholder de `signatureImageRef` sans I/O disque → ✅.
  - `Page 1 contains an empty client signature area` : `drawClientSignatureBlock` dessine un rectangle vide **inconditionnellement**, sans lire `signatures.client()` — satisfait littéralement l'AC.
  - `Page 2 contains one row per calendar day` : itération complète sur `document.page2Days()` en ordre de liste → ✅.
  - `The total worked days appears in the PDF` : `formatFraction(summary.totalWorkedDays())` rendu page 1 → ✅.
  - `Existing tests still pass` : hors du scope 4-fichiers, rien de touché ailleurs, aucune classe existante modifiée → risque nul.
- Contrôle tests JUnit 5 :
  - `generatesTwoPagePdfWithSummaryAndDayDetails` : fixture couvre les 5 `CraPdfDayType`, comment null et non-null, `signatures.client() = null`. Vérifie 2 pages, période, noms/sociétés, `18.5`, `Frais`, `Signature prestataire`, `01/04/2026`, `Signature client`, chaque date de jour + comment non-null.
  - `tolerantToNullProviderContactAndEmptyDayList` : contact null, client-signature null, `page2Days` vide → 2 pages, header page 2 rendu (`Jour`/`Valeur`/`Note`).
- Sécurité :
  - Aucun secret hardcodé.
  - `IOException` encapsulée en `IllegalStateException("Failed to generate CRA PDF", e)` — pas de fuite d'info sensible.
  - `signatureImageRef` rendu comme **texte** dans un cadre, jamais chargé du disque → pas de risque path-traversal ; frontière T027 respectée.
  - Aucun log applicatif ajouté.
- Scope :
  - Pas d'annotation Spring, pas de touche à `com.timizer.*` (T009), pas de bump Spring Boot / Java / Maven.
  - Diff strictement borné aux 4 fichiers du plan.

## Points validés

- Dépendance PDFBox 3.0.3 déclarée exactement comme prévu (`backend/pom.xml:29-33`).
- Générateur en `com.timizerlike.cra.pdf` (hors sous-package `model`) → aucune collision avec les records T015.
- POJO sans annotation Spring : instanciable par tout futur controller T017 sans wiring.
- API publique unique : `public byte[] generate(CraPdfDocument document)`, `try-with-resources` sur `PDDocument` + `ByteArrayOutputStream`, wrapping `IOException`.
- Null-safety défensive et symétrique : `party`, `contact`, `signatures`, `provider`, `days`, `comment`, `dayOfWeek` — aucun NPE atteignable depuis un `CraPdfDocument` partiellement rempli.
- Libellés français cohérents avec l'export Timizer historique.
- README backend documente la dépendance + point d'entrée + version explicite.
- Tests couvrent les critères d'acceptation et le cas dégradé.

## Problèmes détectés

Aucun problème bloquant.

## Risques éventuels

- **Compilation différée** : les records `com.timizerlike.cra.pdf.model.*` vivent sur la branche T015 et ne sont pas présents sur ce worktree (`git merge-base --is-ancestor 98e74ca HEAD` → false). La cohérence des signatures a été validée textuellement, la compilation Java réelle aura lieu au merge sur trunk. C'est aligné avec les assumptions du plan et le même schéma opérationnel que T015. Risque résiduel faible — à confirmer par CI trunk au merge.
- **Encodage WinAnsi** : Helvetica base-14 utilise WinAnsi. Les accentués `é`, `è`, `à` utilisés (`Activité`, `Période`, `prestataire`, `Travaillé`, `Demi-journée`, `Férié`) sont dans WinAnsi → pas d'exception `showText`. Rien à faire.
- **Écarts cosmétiques mineurs vs. plan** (déjà relevés attempts 1 & 2, non-bloquants) :
  - Bloc « Frais » : l'implémentation ajoute un en-tête gras `"Frais"` puis une ligne `"Frais : -"` (tiret ASCII au lieu du cadratin), là où le plan spécifiait une seule ligne `"Frais : —"`. L'AC « contient 'Frais' » reste satisfait ; le tiret ASCII évite tout risque d'encodage.
  - Période rendue sur ligne dédiée `"Période : ..."` au lieu d'être concaténée au titre. La substring `03/2026` reste présente.
  - Un `signatureImageRef` très long peut déborder du cadre 120×60pt (placeholder temporaire remplacé par T027).

## Décision

- APPROVED

## Actions demandées

Aucune action bloquante. Suggestions optionnelles inchangées vs. attempts précédents :

1. Confirmer au merge que la CI compile bien avec les records T015 et que `./mvnw -f backend/pom.xml test` reste vert (dont `CraPdfDocumentTest`).
2. Dans une itération ultérieure, envisager de retirer l'en-tête gras « Frais » redondant pour coller strictement au plan.

IMPLEMENTATION_APPROVED
