# T025 — Create CRA history page

**Source**: GitHub Issue #25

## Description

## Context

The user must be able to find previously created monthly CRA records.

## Goal

Create a frontend page for CRA history.

## Description

Add a history page listing all stored CRA records.

Each row must show the period, status, total worked days, validation date when available, and actions to open the CRA and download the PDF when allowed.

## Out of Scope

- Backend history API implementation
- Calendar editing
- PDF generation
- Client signature
- Search and filters

## Acceptance Criteria

- History page lists CRA records from the backend
- Each CRA row displays period, status, and total worked days
- User can open a CRA from history
- User can download a PDF from history when the CRA is validated
- Empty history state is displayed clearly
- Loading and error states are handled
