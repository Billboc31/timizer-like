# T024 — Create PDF download UI

**Source**: GitHub Issue #24

## Description

## Context

After validation, the user must download the generated CRA PDF and send it to Lyra Network.

## Goal

Add frontend controls to download a CRA PDF.

## Description

Add a download PDF action on the CRA page.

The action must be available for validated CRA records and disabled or hidden for draft CRA records.

The downloaded file must use the filename returned by the backend when available.

## Out of Scope

- Backend PDF generation
- Backend PDF endpoint
- Email sending
- Client signature
- Preview mode

## Acceptance Criteria

- Download action is visible for validated CRA records
- Download action is disabled or hidden for draft CRA records
- Clicking download retrieves the PDF from the backend
- Browser downloads the PDF file
- Download errors are displayed clearly
- Existing frontend checks still pass
