# T056 — Add a detailed CRA history view with explicit covered period

**Source**: GitHub Issue #101

## Description

## Context
The CRA history currently does not expose enough information to understand what each archived CRA contains. At minimum, the user must be able to identify the exact covered period and inspect the CRA details before downloading the PDF.

## Goal
Provide a dedicated history detail view for each CRA, with a clear period and complete read-only monthly information.

## Description
Extend the CRA history experience so each history entry can open a detailed read-only view. Display the exact covered period, provider, client, client contact, total worked days, CRA status, provider-signature status, client-signature status, validation date, signature dates when available, and the daily worked values for the month.

The covered period must be shown prominently in a human-readable form such as `1 juillet 2026 – 31 juillet 2026`, while retaining the month and year as the main title. Provide actions to return to history and download the corresponding PDF.

Historical details must come from the CRA snapshot and must not be replaced by current provider or client settings.

## Out of Scope
- Editing an archived or signed CRA.
- Deleting historical CRAs.
- Comparing several CRAs.

## Acceptance Criteria
- [ ] Each history entry opens a dedicated CRA detail view.
- [ ] The exact start and end dates of the covered period are prominently displayed.
- [ ] Provider, client, contact, total, status, validation, and signature information are visible.
- [ ] All days in the covered month and their values are shown read-only.
- [ ] The PDF download action is available when applicable.
- [ ] Historical values come from the CRA snapshot rather than current settings.
- [ ] Loading, missing, and error states are handled.
- [ ] Desktop, mobile, component, and integration tests cover the detail view.
