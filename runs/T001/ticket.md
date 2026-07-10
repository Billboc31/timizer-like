# T001 — Configure local SQLite database

**Source**: GitHub Issue #4

## Description

## Context

The MVP must store monthly CRA records locally without requiring a complex database setup.

## Goal

Configure SQLite persistence for the backend.

## Description

Add backend configuration for a local SQLite database suitable for development and personal usage.

The database file location must be configurable and documented.

## Out of Scope

- CRA entities
- Migrations for CRA tables
- PostgreSQL support
- Cloud deployment
- Frontend code

## Acceptance Criteria

- Backend can connect to SQLite
- Database file location is configurable
- Local database configuration is documented
- Backend starts successfully with SQLite enabled
- Existing tests still pass
