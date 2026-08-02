# T073 — Enable all CRA editing and workflow actions inside the shared modal

**Source**: GitHub Issue #148

## Description

## Objective

Make the CRA modal introduced by #143 fully interactive so every action available on the normal CRA screen can also be performed inside the modal.

## Current problem

The CRA now opens correctly in a modal, but its content is effectively read-only or exposes only part of the available functionality. The user cannot modify the CRA or complete the normal workflow without leaving the modal.

## Requirements

- Reuse the same CRA editor/domain component in the modal and standalone/deep-link views.
- Do not maintain a separate read-only implementation that can diverge from the main CRA screen.
- Inside the modal, expose every action authorized for the CRA's current state, including when applicable:
  - modify worked and non-worked days;
  - modify hours, durations, comments, categories, or existing CRA fields;
  - save changes;
  - validate and add the consultant signature;
  - generate/copy the client-signature link;
  - view signature status;
  - download or regenerate the PDF;
  - reopen or return a CRA to draft when permitted;
  - delete the CRA when that action already exists and is authorized.
- Apply the same backend permissions, status checks, validation messages, and confirmation dialogs as the standalone CRA view.
- Refresh modal data and the underlying annual calendar/history row after a successful mutation.
- Keep unsaved local edits while the modal remains open.
- Warn before closing, changing route, or clicking the backdrop when unsaved changes exist.
- Prevent duplicate submissions while save, validation, signature, or PDF actions are running.
- Keep action buttons visible and usable when modal content scrolls.
- Preserve keyboard accessibility and focus management from #143.
- On small screens, the full-screen modal/drawer must retain all actions.

## State consistency

- The modal must display the current server state after opening.
- Mutations performed in the modal must immediately update:
  - the modal;
  - the originating annual-calendar month;
  - the corresponding History entry;
  - status and signature indicators.
- Closing and reopening must not show stale data.
- A backend rejection must show its precise reason without silently discarding edits.

## Acceptance criteria

- A draft CRA opened from the annual calendar can be edited and saved entirely inside the modal.
- A CRA opened from History provides the same authorized actions.
- Consultant validation/signature and client-link actions work from the modal.
- PDF download/generation works from the modal.
- Actions unavailable for the current status are hidden or disabled with an understandable reason.
- Closing with unsaved edits requires confirmation.
- Successful mutations update the underlying calendar/history without a full page reload.
- No feature is available only in the old standalone CRA screen unless explicitly documented as out of scope.
- Shared component tests prove parity between modal and standalone/deep-link rendering.
- Integration tests cover editing, saving, validation, PDF download, error handling, and unsaved-change protection.

## Relationship to existing work

This ticket completes #143. The shared CRA modal must be a complete working view, not only a read-only detail preview.
