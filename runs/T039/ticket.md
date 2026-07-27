# T039 — Redesign the CRA history page

**Source**: GitHub Issue #71

## Description

## Context
Historical CRAs must be easy to scan, identify, and download. The current history interface does not provide a polished business-oriented experience.

## Goal
Create a clean and responsive CRA history view with clear status and actions.

## Description
Refactor the history page to present one row or card per monthly CRA. Display period, total worked days, status, validation date when available, and PDF action. Sort the most recent CRA first. Provide a dedicated empty state and clear loading and error states.

## Out of Scope
- Adding pagination unless required by the current data volume.
- Changing the backend history contract.
- Adding deletion of historical CRAs.

## Acceptance Criteria
- [ ] CRAs are ordered from newest to oldest.
- [ ] Period, total, status, and available actions are easy to scan.
- [ ] Draft and validated entries are visually distinct.
- [ ] PDF download is available only when applicable.
- [ ] Empty, loading, and failure states are handled.
- [ ] The view works on desktop and mobile without horizontal overflow.
- [ ] Rows or cards are keyboard accessible.
