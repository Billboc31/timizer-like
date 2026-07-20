# T023 — Create CRA validation UI

**Source**: GitHub Issue #23

## Description

## Context

Once the monthly CRA is complete, the user must validate it before downloading the final PDF.

## Goal

Add frontend validation controls for a CRA.

## Description

Add a validate action in the CRA page.

The UI must ask for confirmation before validation because validation locks the CRA.

After validation, the page must show the CRA as validated and prevent further day changes.

## Out of Scope

- Backend validation API implementation
- PDF download button
- Client signature
- Reopen workflow
- Authentication

## Acceptance Criteria

- User can trigger CRA validation from the CRA page
- Confirmation is shown before validation
- Successful validation updates the CRA status in the UI
- Validated CRA appears locked
- Validation errors are displayed clearly
- Existing frontend checks still pass
