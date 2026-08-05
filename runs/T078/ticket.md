# T078 — Replace provider profile fields and include them in CRA PDFs

**Source**: GitHub Issue #156

## Description

## Objective

Replace the current provider information model with the required legal company fields, make them editable from Settings, and display them in generated CRA PDFs.

## Required provider fields

- Raison sociale
- SIRET
- Adresse
- Code postal
- Ville
- Pays

## Requirements

- Remove provider fields that are no longer relevant from the data model, API payloads, forms, and PDF rendering.
- Add the six required fields to the provider model and persistence layer.
- Provide any required migration for existing installations without breaking startup.
- Add editable inputs for all fields in the Settings page.
- Load existing saved values when opening Settings.
- Validate required formats where appropriate, especially SIRET and postal code, without applying overly restrictive country-specific validation to non-French addresses.
- Save updates through the existing provider/settings API.
- Add provider legal information to the CRA PDF in a clear, professional area, preferably in the document header or identity block.
- Ensure long company names and addresses wrap correctly without breaking the A4 layout.
- Avoid displaying obsolete provider fields anywhere after migration.

## Acceptance criteria

- The provider can edit and persist raison sociale, SIRET, address, postal code, city, and country from Settings.
- Saved values are restored after a page refresh and application restart.
- Generated CRA PDFs contain the saved provider legal information.
- Obsolete provider fields are removed from the Settings UI and PDF.
- Existing data migration is handled safely.
- The PDF remains readable and correctly laid out when values are long or partially missing.
