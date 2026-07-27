# T031 — Deploy the application

**Source**: GitHub Issue #61

## Description

## Context

The MVP must be accessible outside the local development environment so the monthly CRA workflow can be used from a web browser.

## Goal

Make the complete application available in a production environment.

## Description

Provide a production deployment for the React frontend, Spring Boot backend, SQLite database, generated PDF files, and provider signature asset.

Runtime configuration and sensitive values must be externalized from the source code.

Application data and generated CRA documents must survive application restarts and redeployments.

The deployed application must expose a documented public URL and provide a simple way to verify that the frontend and backend are operational.

## Out of Scope

- Client signature workflow
- Multi-environment deployment
- Automatic scaling
- High-availability architecture
- Monitoring platform integration
- Provider-specific infrastructure beyond what is required for the first deployment

## Acceptance Criteria

- The frontend is accessible from a documented production URL
- The frontend can communicate with the deployed backend
- The backend starts with production configuration
- SQLite data survives application restarts and redeployments
- Generated PDF files and the provider signature asset remain available after restart
- Sensitive configuration is not committed to the repository
- A health or status check confirms that the backend is operational
- Deployment and update instructions are documented
- The full CRA workflow can be completed in the deployed environment
- Existing tests still pass
