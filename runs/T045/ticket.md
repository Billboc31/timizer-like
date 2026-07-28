# T045 — Run frontend quality checks automatically in CI

**Source**: GitHub Issue #77

## Description

## Context
UI bugs and test failures must be detected before code is merged rather than during manual use.

## Goal
Create a reliable automated quality gate for the Timizer-like frontend.

## Description
Configure the repository's continuous integration workflow to install frontend dependencies and run formatting or style checks, linting, type checking when applicable, component tests, production build, and the stable end-to-end test subset. Preserve useful logs and screenshots when browser tests fail.

## Out of Scope
- Automatic deployment.
- Backend performance testing.
- Running flaky visual tests as a mandatory gate until they are stable.

## Acceptance Criteria
- [ ] CI runs on pull requests affecting frontend code.
- [ ] Linting and type errors fail the workflow.
- [ ] Component test failures fail the workflow.
- [ ] A production frontend build is verified.
- [ ] Critical end-to-end tests run automatically.
- [ ] Browser failure screenshots or traces are retained as artifacts when supported.
- [ ] The workflow and local equivalent commands are documented.
