# T049 — Add editable provider profile settings

**Source**: GitHub Issue #94

## Description

## Context
Provider information currently appears in the CRA and generated PDF but cannot be modified from the application.

## Goal
Allow the user to manage the provider identity and company information used for future CRAs and PDFs.

## Description
Add a provider settings model, persistence, backend API, and frontend form. Support at least provider full name, company name, postal address, email, phone, and any existing provider fields already rendered in the PDF.

Saved provider settings must be used when creating a new monthly CRA. Historical validated CRAs must preserve the values captured at validation time and must not silently change when settings are edited later.

## Out of Scope
- Multiple provider accounts.
- Authentication and role management.
- Legal company verification.

## Acceptance Criteria
- [ ] A dedicated settings screen allows provider information to be viewed and edited.
- [ ] Required fields are validated with clear messages.
- [ ] Changes persist after page reload and backend restart.
- [ ] New CRAs use the current provider settings.
- [ ] Previously validated CRA PDFs retain their original provider information.
- [ ] Save, loading, success, and failure states are handled.
- [ ] Backend and frontend tests cover reading, updating, validation, and snapshot behaviour.
