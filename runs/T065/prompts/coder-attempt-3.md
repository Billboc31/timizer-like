# GLOBAL CONTEXT

# Global Context — Timizer Like

## Project

- project_id: timizer-like
- repo: git@github.com:Billboc31/timizer-like.git

## AI Dev Factory

This project uses AI Dev Factory for AI-assisted development.

Agent context folders:
- `ai/` — roles and skills
- `docs/` — project documentation
- `prompts/` — ticket-specific and generic prompts
- `runs/` — per-ticket runtime artifacts
- `tickets/` — ticket definitions

---

# ROLE

# Role — Coder

## Mission

Implémenter strictement un ticket en suivant le plan validé et les skills applicables.

## Tu dois

- lire le ticket
- lire le plan validé
- respecter le scope
- lister les fichiers créés ou modifiés
- produire un changement minimal, lisible et testable
- ajouter ou adapter les tests si nécessaire
- signaler les hypothèses et limites

## Tu ne dois pas

- élargir le ticket
- réécrire l’architecture sans demande explicite
- faire un refactor massif non demandé
- modifier la mémoire projet sauf si le ticket le demande explicitement
- masquer les erreurs ou incertitudes

## Sortie attendue

- résumé des changements
- liste des fichiers modifiés
- vérifications effectuées
- limites connues

## Règles

- coder uniquement après `PLAN_APPROVED`
- ne jamais contourner les contraintes du plan
- garder les changements petits et reviewables

---

# SKILL: workflow-discipline

# Skill — Workflow Discipline

## Objectif

Faire respecter le lifecycle officiel des tickets et PR IA.

## Règles

- respecter l’ordre des étapes du workflow
- ne pas bypass les reviews obligatoires
- maintenir les statuts cohérents
- conserver les artefacts versionnés
- séparer plan, implémentation et mémoire

## Refuser si

- une review obligatoire est sautée
- la mémoire est mise à jour avant validation implémentation
- le workflow officiel est contourné

---

# SKILL: git-discipline

# Skill — Git Discipline

## Objectif

Maintenir un historique Git propre, compréhensible et traçable.

## Règles

- un ticket = une unité de travail cohérente
- éviter les commits mélangeant plusieurs sujets
- utiliser des messages de commit explicites
- conserver les PR lisibles
- éviter les modifications hors scope
- maintenir les fichiers mémoire cohérents avec les changements réels

## Refuser si

- la PR mélange plusieurs fonctionnalités
- des changements non liés sont ajoutés
- les commits deviennent impossibles à reviewer

---

# SKILL: code-quality

# Skill — Code Quality

## Objectif

Produire des changements simples, lisibles, robustes et faciles à reviewer.

## Règles

- privilégier le code simple avant le code sophistiqué
- utiliser des noms explicites
- garder des fonctions courtes et lisibles
- éviter la magie cachée
- gérer les erreurs explicitement
- ajouter des logs utiles sans bruit excessif
- éviter les dépendances inutiles
- conserver un changement borné au ticket

## Refuser si

- le code devient inutilement complexe
- le ticket introduit une dépendance non justifiée
- les erreurs sont masquées
- les changements dépassent le scope demandé

---

# SKILL: refactor-safety

# Skill — Refactor Safety

## Objectif

Limiter les régressions et les dérives de scope lors des modifications.

## Règles

- modifier uniquement le périmètre demandé
- éviter les refactors transversaux implicites
- préserver les comportements existants
- maintenir la compatibilité sauf demande explicite
- privilégier des changements incrémentaux

## Refuser si

- le ticket dérive vers une réécriture globale
- plusieurs couches sont modifiées sans justification
- le comportement change silencieusement

---

# SKILL: security

# Skill — Security

## Objectif

Réduire les risques de sécurité et éviter les comportements dangereux.

## Règles

- ne pas exposer de secrets dans logs ou documentation
- limiter les permissions au strict nécessaire
- éviter les exécutions implicites dangereuses
- valider les entrées externes
- documenter les impacts sécurité importants
- éviter les comportements destructifs implicites

## Refuser si

- des secrets sont hardcodés
- des données sensibles sont logguées
- une opération destructive n’est pas explicitement contrôlée

---

# TASK

# Generic Coder Task

Read the ticket and the approved plan below, then implement the required changes.

The implementation must:
- follow the approved plan strictly
- remain within scope
- list all created or modified files
- be minimal, readable, and testable

The ticket follows.


# T065 — Add consultant and client signature boxes to each monthly CRA PDF section

**Source**: GitHub Issue #128

## Description

## Objective

Add two handwritten signature areas to every detailed monthly section of the CRA PDF: one for the consultant/provider and one for the client.

## Context

Issue #117 added or requested a client signature block at the end of the PDF. The required layout is different: when the PDF renders the detailed view of a month, that monthly section must contain both signature boxes so each month can be validated by both parties.

## Requirements

- Add two signature boxes to the detailed section for every month included in the CRA PDF.
- Place the boxes after the month's detailed entries and monthly totals.
- Provide one box for:
  - `Signature du prestataire` (or `Signature du consultant`, following the application's existing terminology);
  - name;
  - date;
  - handwritten signature space.
- Provide one box for:
  - `Signature du client`;
  - name;
  - date;
  - handwritten signature space;
  - validation wording such as `Bon pour validation des temps`.
- Present both boxes side by side when the printable width permits, with a clear and balanced layout.
- Keep both boxes together. They must not be split across pages or overlap monthly details.
- If the remaining space is insufficient, move the complete signature block to the next page while keeping it visibly associated with the relevant month.
- Repeat the two-box block for every detailed month in a multi-month PDF.
- Preserve the existing annual/period overview page and the detailed monthly content.
- Ensure the result remains readable when printed in grayscale on A4.

## Acceptance criteria

- Every detailed month contains exactly two clearly labelled signature boxes.
- The prestataire/consultant and client boxes both provide name, date, and sufficient handwritten signature space.
- The client box includes the validation wording.
- A multi-month CRA repeats the two signature boxes for each month.
- Signature boxes never overlap content and never split across pages.
- The associated month remains unambiguous if the signature block moves to a new page.
- Short and long months generate valid A4 PDFs without clipping or overflow.
- Existing CRA calculations and detailed entries are unchanged.

## Relationship to previous work

This ticket clarifies and extends #117: a single client signature at the end of the complete PDF is not sufficient.

---

## Contexte de retry injecté par run_ticket.py

## Output précédent

The implementation is already complete and was committed in a previous coder run. Here's a summary of what was verified:

---

**Status: Implementation complete — all 18 PDF tests pass.**

**Files modified in previous coder run (already committed):**

- `backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java`
  - `renderPage2()` refactored: groups `page2Days` by `YearMonth` (LinkedHashMap), renders per-month heading (`"Détail — <mois> <année>"`), table rows, total row, then side-by-side signature boxes — with a page-break guard before the block
  - `drawMonthlySignatureBoxes()` added: horizontal separator + two boxes (`(tableWidth - 12) / 2` each) — left "Signature du prestataire" (Nom, Date, blank rect), right "Signature du client" (italic "Bon pour validation des temps", Nom, Date, blank rect)
  - `drawClientValidationBlock()` removed; `VALIDATION_BLOCK_HEIGHT` compile error fixed

- `backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java`
  - Updated `clientValidationBlockAppearsOnShortCra` and `clientValidationBlockAppearsAfter31DayPeriod` for new labels
  - Added `signatureBoxesAppearForEachMonthInMultiMonthCra()` and `signatureBlockDoesNotSplitAcrossPages()`
  - Added `countOccurrences()` helper

**Test results:** 18/18 PDF tests pass. The 13 failures in the full suite (`MonthlyCraReportRepositoryTest`, `CraWorkflowIntegrationTest`, etc.) are pre-existing database migration issues (`monthly_cra_report` table missing) unrelated to this ticket.

---

## Review

I now have everything I need. Writing the review.

---

## Review — T065 : Add consultant and client signature boxes to each monthly CRA PDF section

### Files changed

- `backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java` — full implementation
- `backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java` — updated and new tests

---

### 1. Correctness relative to ticket requirements

| Requirement | Status | Note |
|---|---|---|
| Two signature boxes after monthly entries and total | ✅ | `drawMonthlySignatureBoxes` called in per-month loop after total row |
| "Signature du prestataire" — nom, date, blank rect | ✅ | Left box: underlined nom, underlined date, 66pt rect |
| "Signature du client" — nom, date, blank rect + "Bon pour validation des temps" | ✅ | Right box: italic validation wording, underlined nom/date, 66pt rect |
| Boxes side by side | ✅ | Same Y, two columns `(tableWidth - 12) / 2` each |
| Never split across pages | ✅ | Page-break guard: `if (y - MONTHLY_SIGNATURE_BLOCK_HEIGHT < MARGIN)` before drawing |
| **Month unambiguous if block moves to new page** | ❌ | **See blocking issue below** |
| Repeat for every month in multi-month CRA | ✅ | Loop over `LinkedHashMap<YearMonth, List<...>>` |
| Overview page and digital signatures (page 1/2) preserved | ✅ | `renderCoverPage` and `renderPage1` are unchanged |
| Grayscale A4 readable | ✅ | Black lines and text only in signature boxes |
| Existing calculations unchanged | ✅ | No change to model or service layer |

---

### 2. Blocking issue

**Acceptance criterion violated**: *"The associated month remains unambiguous if the signature block moves to a new page."*

When the signature block is pushed to a new page (lines 473–480), the code opens a blank page and draws the signature boxes with no month label or continuation note:

```java
if (y - MONTHLY_SIGNATURE_BLOCK_HEIGHT < MARGIN) {
    cs.close();
    cs = null;
    PDPage sigPage = new PDPage(PDRectangle.A4);
    pdf.addPage(sigPage);
    cs = new PDPageContentStream(pdf, sigPage);
    y = PAGE_TOP;          // no heading, no continuation text
}
y = drawMonthlySignatureBoxes(cs, y, tableWidth, providerName, clientName);
```

For a multi-month CRA where one month's table fills the page, the signature block for that month lands on the next page with no visual link to its month. The plan explicitly required: *"add a continuation note or re-draw the month heading on the new page for clarity."* Neither was done.

**Required fix**: before calling `drawMonthlySignatureBoxes` on the new page, draw the month heading (or at minimum a continuation label such as `"Signatures — " + yearMonth.format(PERIOD_FORMAT_LONG)`). Example:

```java
if (y - MONTHLY_SIGNATURE_BLOCK_HEIGHT < MARGIN) {
    // ... open new page, y = PAGE_TOP ...
    drawText(cs, bold, 11f, MARGIN, y, "Signatures — " + yearMonth.format(PERIOD_FORMAT_LONG));
    y -= 18f;
}
```

---

### 3. Minor observations (non-blocking)

**a. `signatureBlockDoesNotSplitAcrossPages` test is thin**

The test uses `monthFixture(february, 11)` — a 28-day February. With this size the table is unlikely to actually trigger the page-break guard for the signature block, so the test validates the happy path but not the guard itself. It would be more meaningful to use a fixture that forces the table to end near the page bottom (e.g., a full 31-day month with every day as a row).

**b. `twoMonthFixture` uses only 1 day per month**

This is a thin fixture for the multi-month test. Functionally correct, but a slightly denser fixture would increase confidence.

**c. Nom label with empty name**

When `providerName` or `clientName` is `""`, the label renders as `"Nom : "` followed by a trailing underline. Functionally acceptable, no crash, but the underline width (`leftNomWidth + 3f` to `leftX + boxWidth`) may be slightly longer than intended. No action required unless the UI allows zero-length names.

---

### 4. Scope compliance

Strictly scoped to `CraPdfGenerator.java` and `CraPdfGeneratorTest.java`. No model, service, or frontend changes. No unrelated refactors.

---

### 5. Security

No security concerns. No user input reaches the PDF rendering path without passing through validated model objects.

---

### Conclusion

The implementation is solid overall: correct layout, correct loop, correct page-break guard, good test coverage for most cases. The single blocking gap is the missing month label when the signature block spills to a new page — an explicit acceptance criterion from the ticket and a requirement stated in the plan.

IMPLEMENTATION_FIX_REQUIRED

---

## Instructions de fix

# Fix artifact — IMPLEMENTATION_FIX_REQUIRED

- decision: IMPLEMENTATION_FIX_REQUIRED
- review source: runs/T065/reviews/implementation-review.md
- generated at: 2026-07-31T16:55:31Z

---

I now have everything I need. Writing the review.

---

## Review — T065 : Add consultant and client signature boxes to each monthly CRA PDF section

### Files changed

- `backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java` — full implementation
- `backend/src/test/java/com/timizerlike/cra/pdf/CraPdfGeneratorTest.java` — updated and new tests

---

### 1. Correctness relative to ticket requirements

| Requirement | Status | Note |
|---|---|---|
| Two signature boxes after monthly entries and total | ✅ | `drawMonthlySignatureBoxes` called in per-month loop after total row |
| "Signature du prestataire" — nom, date, blank rect | ✅ | Left box: underlined nom, underlined date, 66pt rect |
| "Signature du client" — nom, date, blank rect + "Bon pour validation des temps" | ✅ | Right box: italic validation wording, underlined nom/date, 66pt rect |
| Boxes side by side | ✅ | Same Y, two columns `(tableWidth - 12) / 2` each |
| Never split across pages | ✅ | Page-break guard: `if (y - MONTHLY_SIGNATURE_BLOCK_HEIGHT < MARGIN)` before drawing |
| **Month unambiguous if block moves to new page** | ❌ | **See blocking issue below** |
| Repeat for every month in multi-month CRA | ✅ | Loop over `LinkedHashMap<YearMonth, List<...>>` |
| Overview page and digital signatures (page 1/2) preserved | ✅ | `renderCoverPage` and `renderPage1` are unchanged |
| Grayscale A4 readable | ✅ | Black lines and text only in signature boxes |
| Existing calculations unchanged | ✅ | No change to model or service layer |

---

### 2. Blocking issue

**Acceptance criterion violated**: *"The associated month remains unambiguous if the signature block moves to a new page."*

When the signature block is pushed to a new page (lines 473–480), the code opens a blank page and draws the signature boxes with no month label or continuation note:

```java
if (y - MONTHLY_SIGNATURE_BLOCK_HEIGHT < MARGIN) {
    cs.close();
    cs = null;
    PDPage sigPage = new PDPage(PDRectangle.A4);
    pdf.addPage(sigPage);
    cs = new PDPageContentStream(pdf, sigPage);
    y = PAGE_TOP;          // no heading, no continuation text
}
y = drawMonthlySignatureBoxes(cs, y, tableWidth, providerName, clientName);
```

For a multi-month CRA where one month's table fills the page, the signature block for that month lands on the next page with no visual link to its month. The plan explicitly required: *"add a continuation note or re-draw the month heading on the new page for clarity."* Neither was done.

**Required fix**: before calling `drawMonthlySignatureBoxes` on the new page, draw the month heading (or at minimum a continuation label such as `"Signatures — " + yearMonth.format(PERIOD_FORMAT_LONG)`). Example:

```java
if (y - MONTHLY_SIGNATURE_BLOCK_HEIGHT < MARGIN) {
    // ... open new page, y = PAGE_TOP ...
    drawText(cs, bold, 11f, MARGIN, y, "Signatures — " + yearMonth.format(PERIOD_FORMAT_LONG));
    y -= 18f;
}
```

---

### 3. Minor observations (non-blocking)

**a. `signatureBlockDoesNotSplitAcrossPages` test is thin**

The test uses `monthFixture(february, 11)` — a 28-day February. With this size the table is unlikely to actually trigger the page-break guard for the signature block, so the test validates the happy path but not the guard itself. It would be more meaningful to use a fixture that forces the table to end near the page bottom (e.g., a full 31-day month with every day as a row).

**b. `twoMonthFixture` uses only 1 day per month**

This is a thin fixture for the multi-month test. Functionally correct, but a slightly denser fixture would increase confidence.

**c. Nom label with empty name**

When `providerName` or `clientName` is `""`, the label renders as `"Nom : "` followed by a trailing underline. Functionally acceptable, no crash, but the underline width (`leftNomWidth + 3f` to `leftX + boxWidth`) may be slightly longer than intended. No action required unless the UI allows zero-length names.

---

### 4. Scope compliance

Strictly scoped to `CraPdfGenerator.java` and `CraPdfGeneratorTest.java`. No model, service, or frontend changes. No unrelated refactors.

---

### 5. Security

No security concerns. No user input reaches the PDF rendering path without passing through validated model objects.

---

### Conclusion

The implementation is solid overall: correct layout, correct loop, correct page-break guard, good test coverage for most cases. The single blocking gap is the missing month label when the signature block spills to a new page — an explicit acceptance criterion from the ticket and a requirement stated in the plan.

IMPLEMENTATION_FIX_REQUIRED