# T052 — Add CRA signature workflow and signature status tracking

**Source**: GitHub Issue #97

## Description

## Context
A CRA now needs a clear lifecycle covering preparation, provider signature, client signature, and final completion.

## Goal
Introduce explicit signature states and enforce valid transitions throughout the application.

## Description
Extend the CRA model and APIs with a signature workflow such as draft, ready for provider signature, provider signed, awaiting client signature, and fully signed. Define which fields remain editable at each stage and which actions are available.

The frontend must display the current signature status prominently and present only valid next actions. Invalid or repeated signature operations must be rejected by the backend with a clear business error.

## Out of Scope
- Email delivery.
- Implementing the client signature page itself.
- Qualified electronic signature certification.

## Acceptance Criteria
- [ ] CRA signature statuses are explicitly represented in the domain model.
- [ ] Valid status transitions are documented and enforced server-side.
- [ ] The current status is clearly displayed in the CRA interface and history.
- [ ] Editing rules are enforced consistently after provider or client signature.
- [ ] Invalid and duplicate transitions return a clear error.
- [ ] Existing validated CRAs are migrated or mapped safely.
- [ ] Unit and integration tests cover every allowed and rejected transition.
