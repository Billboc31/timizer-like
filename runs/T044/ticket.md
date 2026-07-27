# T044 — Add visual regression coverage for the main Timizer-like screens

**Source**: GitHub Issue #76

## Description

## Context
A visual redesign can regress silently when later tickets modify shared styles or components.

## Goal
Detect unintended visual changes on the application's most important screens.

## Description
Add deterministic screenshot-based tests for the current CRA screen, a partially completed calendar, a validated CRA, the history page, and representative loading and error states. Stabilize fonts, viewport sizes, dates, and fixture data so screenshots are reliable.

Keep the initial visual suite small and focused on high-value screens.

## Out of Scope
- Screenshot coverage for every minor component.
- Treating intentional visual changes as failures without updating approved baselines.
- Pixel-perfect comparison across unsupported operating systems.

## Acceptance Criteria
- [ ] Main CRA screen has a desktop visual baseline.
- [ ] Main CRA screen has a mobile visual baseline.
- [ ] History page has a visual baseline.
- [ ] At least one loading or error state has a visual baseline.
- [ ] Test data and selected month are deterministic.
- [ ] Visual tests can be executed with one documented command.
- [ ] A genuine layout change causes the test to fail.
