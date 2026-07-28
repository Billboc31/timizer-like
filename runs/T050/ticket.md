# T050 — Add editable client and client-contact settings

**Source**: GitHub Issue #95

## Description

## Context
Client and client-contact information is required on the CRA and PDF but cannot currently be modified from the application.

## Goal
Allow the user to configure the client organisation and signing contact used for new monthly CRAs.

## Description
Add persistent client settings with a backend API and frontend form. Support at least client company name, postal address, contact full name, contact role, contact email, and any existing client fields rendered in the PDF.

New CRAs must copy the current client settings. Validated historical CRAs must preserve their captured client information even when the default client settings later change.

## Out of Scope
- Managing several clients or missions.
- CRM functionality.
- Automatically importing contacts from external services.

## Acceptance Criteria
- [ ] A settings screen allows client and contact details to be viewed and edited.
- [ ] Contact email and required fields are validated.
- [ ] Changes persist after reload and backend restart.
- [ ] New CRAs use the current client settings.
- [ ] Validated historical CRAs retain their original client details.
- [ ] The configured contact is available to the future client-signature workflow.
- [ ] Backend and frontend tests cover update, validation, persistence, and snapshot behaviour.
