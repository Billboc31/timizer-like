# T079 — Allow permanent deletion of unsigned and unvalidated CRAs

**Source**: GitHub Issue #157

## Description

## Objective

Allow a provider to permanently delete a CRA from History and CRA views only while it has not been validated or signed by a client.

## Requirements

- Add a delete action in the History page for eligible CRAs.
- Add the same delete action in the CRA detail/calendar view when eligible.
- Restrict deletion to CRAs that have not reached a client-validated or client-signed final status.
- Enforce the restriction in the backend; hiding the button in the UI is not sufficient.
- Ask for explicit confirmation before permanent deletion and clearly state that the action cannot be undone.
- Permanently delete the CRA and associated dependent data that should not survive independently, such as day entries, generated temporary artifacts, pending signature tokens/requests, and related records according to the existing data model.
- Avoid deleting shared provider, client, or project data.
- Refresh History and calendar views immediately after deletion.
- Signed/final CRAs must not show a delete action.
- A direct API deletion attempt for a signed/final CRA must be rejected with a clear conflict or validation error.

## Acceptance criteria

- An unsigned and unvalidated CRA can be deleted from History.
- An unsigned and unvalidated CRA can be deleted from its CRA view.
- A confirmation dialog is shown before deletion.
- After confirmation, the CRA disappears from all views and cannot be retrieved again.
- Signed or client-validated CRAs cannot be deleted through either the UI or API.
- Deletion does not remove unrelated client, provider, or project records.

## Dependency

This ticket should use the terminal signed status introduced by the issue that makes client-signed CRAs final and immutable.
