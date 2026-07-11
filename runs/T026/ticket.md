# T026 — Create default CRA settings

**Source**: GitHub Issue #26

## Description

## Context

The MVP is personal and should avoid asking the user to re-enter the same provider and client data every month.

## Goal

Provide default CRA metadata for generated reports.

## Description

Add configurable default CRA settings for provider name, provider company, provider address, client name, client address, and client contact.

Defaults must match the personal Lyra Network CRA use case but remain configurable without code changes.

## Out of Scope

- Multi-client management
- Settings UI
- Authentication
- Client signature
- Invoicing

## Acceptance Criteria

- Provider name can be configured
- Provider company and address can be configured
- Client name and address can be configured
- Client contact name and email can be configured
- New CRA records use configured defaults
- Configuration is documented
