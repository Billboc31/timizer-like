## Objective
Create a concise MVP product scope document that captures the functional boundaries of the personal Timizer-like tool used for Lyra Network monthly CRA reports, so that subsequent implementation tickets share a single, unambiguous functional target.

## Included
- Create a new documentation file `docs/product-scope.md` containing the MVP scope.
- Structure the document with the following level-2 sections:
  - `## Context` — short paragraph explaining that this is a personal tool for producing monthly CRA (compte rendu d'activité) reports for freelance work with Lyra Network.
  - `## MVP scope` — bulleted list of the in-scope features:
    - single personal user (no auth complexity beyond local usage)
    - single client context (Lyra Network)
    - one CRA per month
    - day-by-day work entry (per calendar day)
    - CRA validation step by the provider
    - PDF generation with provider signature embedded
    - CRA history browsing
    - PDF download of any past CRA
  - `## Out of scope (MVP)` — bulleted list mirroring the ticket exclusions:
    - client signature workflow (explicitly marked as **phase 2**)
    - multi-user support
    - invoicing
    - expenses management
    - Timizer feature parity
    - implementation code (this ticket is scope-only)
  - `## Target stack` — short list stating: frontend React, backend Spring Boot, database SQLite.
  - `## Notes` — one or two sentences stating that this document is the functional reference for downstream tickets and that changes to the MVP scope require a dedicated ticket.
- Add a single-line entry in `docs/README.md` (or create it if absent) pointing to `product-scope.md`, so the scope document is discoverable. If a `docs/` index already exists under a different name, extend that instead of creating a duplicate.
- No source code, no configuration, no dependencies added.

## Excluded
- Any implementation work (React app, Spring Boot service, SQLite schema, PDF generation library selection).
- Detailed UX mockups, wireframes, or user flows.
- Data model or API contract definitions.
- Non-functional requirements (performance, security posture, deployment).
- Client signature workflow specification (deferred to phase 2, only *named* in this document).
- Any modification to existing tickets, prompts, agent roles, or runtime artefacts under `runs/`, `prompts/`, `tickets/`, `ai/`.

## Acceptance criteria
- `docs/product-scope.md` exists at the repository root under `docs/`.
- The document contains the sections: Context, MVP scope, Out of scope (MVP), Target stack, Notes (titles may be phrased equivalently but must cover these five topics).
- The MVP scope section lists **all** of: one personal user, one client context, one CRA per month, day-by-day work entry, CRA validation, PDF generation with provider signature, CRA history, PDF download.
- The document explicitly states that the **client signature workflow is phase 2** (out of MVP scope).
- The document explicitly mentions the target stack: **React**, **Spring Boot**, **SQLite**.
- No existing file under `ai/`, `prompts/`, `tickets/`, `runs/`, or the repository root is modified in a way that breaks existing references (only additive changes under `docs/`, plus an optional one-line index entry).
- The document is plain Markdown, renders correctly (no broken headings or lists), and is under ~100 lines to remain concise and reviewable.
