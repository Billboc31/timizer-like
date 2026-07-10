# T009 — Bootstrap Spring Boot backend

**Source**: GitHub Issue #2

## Description

## Context

The MVP requires a backend API for storing CRA data and generating PDFs.

## Goal

Create the backend application foundation.

## Description

Initialize a Spring Boot backend project inside the repository with a clear backend folder structure.

The backend must be runnable locally and expose a basic health endpoint or equivalent startup verification endpoint.

## Out of Scope

- CRA domain model
- Database persistence
- PDF generation
- Authentication
- Frontend code
- Tests beyond basic startup verification

## Acceptance Criteria

- Backend project exists in the repository
- Backend can start locally
- A basic health or status endpoint returns a successful response
- Backend dependencies are declared in the project configuration
- Existing project files are not broken
