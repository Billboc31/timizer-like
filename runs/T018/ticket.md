# T018 — Create frontend API client

**Source**: GitHub Issue #18

## Description

## Context

The React frontend must communicate with the Spring Boot backend.

## Goal

Create a frontend API client for CRA operations.

## Description

Add frontend API client functions for creating a CRA, retrieving a CRA, updating a day entry, validating a CRA, listing CRA history, and downloading a PDF.

API errors must be surfaced in a consistent way for UI components.

## Out of Scope

- Calendar UI
- History UI
- Backend API implementation
- Authentication
- Client signature

## Acceptance Criteria

- Frontend can call CRA creation API
- Frontend can call CRA retrieval API
- Frontend can call day update API
- Frontend can call validation API
- Frontend can call history API
- Frontend can trigger PDF download
- API errors are represented consistently
