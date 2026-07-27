# T037 — Add robust loading, empty, success, and error states to all frontend screens

**Source**: GitHub Issue #69

## Description

## Context
The current Timizer-like interface exposes raw or broken states when data is loading, missing, saved, or unavailable.

## Goal
Make every user flow feel reliable and professional by providing explicit UI feedback for asynchronous operations and failures.

## Description
Review all existing frontend routes and actions, including CRA loading, day updates, monthly validation, history loading, and PDF download. Add consistent loading indicators, empty states, success feedback, and actionable error messages. Prevent duplicate submissions while a request is in progress.

Errors must be understandable to a non-technical user. Raw stack traces, HTTP payloads, and generic messages such as `Something went wrong` must not be displayed.

## Out of Scope
- Backend business-rule changes.
- Full visual redesign of the calendar.
- Adding a notification service outside the frontend.

## Acceptance Criteria
- [ ] Every API-driven screen has a visible loading state.
- [ ] Empty CRA history and missing CRA states have dedicated messages and actions.
- [ ] Save, validation, and PDF actions show progress and disable duplicate clicks.
- [ ] Successful actions provide clear confirmation.
- [ ] API and network failures display user-friendly messages.
- [ ] Retrying a failed operation is possible where relevant.
- [ ] No uncaught promise rejection appears in the browser console during tested flows.
