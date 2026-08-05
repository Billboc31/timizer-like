# T077 — Make client-signed CRA status final and immutable

**Source**: GitHub Issue #155

## Description

## Objective

Automatically move a CRA to a final signed status after client signature and prevent any further modification.

## Problem

After the client signs a CRA, its status does not change. The CRA can therefore still appear editable even though the client validation should make it definitive.

## Requirements

- Define a final status for a client-signed CRA, for example `SIGNED` or `CLIENT_VALIDATED`, using the project's existing status conventions.
- Update the CRA status atomically when the client signature is successfully persisted.
- Store the signature timestamp and signer information already available from the signature flow.
- Treat the signed status as terminal and immutable.
- Reject all later mutation attempts, including calendar/day changes, period changes, metadata changes, regeneration actions that alter business data, and deletion.
- Enforce immutability in the backend, not only by disabling UI controls.
- Update all relevant views, including CRA detail, History, calendars, and PDF-related actions, to display the final signed status.
- Disable or hide edit/delete controls for signed CRAs and explain that the CRA has been definitively validated by the client.
- Ensure repeated signature callbacks or submissions are idempotent and do not create inconsistent states.

## Acceptance criteria

- A successful client signature changes the CRA to the final signed status.
- The new status is immediately visible in the UI after refresh and in History.
- A signed CRA cannot be modified or deleted through the UI or API.
- Backend mutation attempts return a clear conflict or validation error.
- Signing the same CRA twice does not corrupt or duplicate signature data.
- Unsigned CRAs continue to follow the existing editable workflow.
