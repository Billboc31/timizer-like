# T071 — Fix broken client CRA signature links end to end

**Source**: GitHub Issue #142

## Description

## Objective

Fix generated client-signature links so recipients can open the public CRA signature page and complete validation successfully.

## Current problem

The link supplied for client signature does not work. The defect must be reproduced from link generation through public route loading and signature submission rather than patched only in the UI.

## Investigation scope

Verify the complete flow:

1. consultant validates and signs the CRA;
2. Timizer generates or displays the client-signature link;
3. the link is copied or sent;
4. the recipient opens it outside the authenticated Timizer session;
5. the public route resolves the token;
6. the CRA summary loads;
7. the client submits a signature;
8. the CRA moves to the expected validated state.

## Requirements

- Generate an absolute, externally reachable URL using configured public frontend/base URL values.
- Never generate localhost, container-internal, backend-only, or relative URLs for external recipients unless explicitly configured for local development.
- Ensure the frontend public-signature route matches the generated URL format.
- Ensure reverse proxy and SPA fallback serve the signature route after direct navigation or page refresh.
- Ensure the token reaches the backend exactly as generated without unwanted encoding/truncation.
- Validate token existence, CRA association, expiry, use state, and signature eligibility.
- The client-signature page must work without an authenticated user session.
- Return a clear page for:
  - invalid token;
  - expired token;
  - already-used/already-signed token;
  - CRA not ready for client signature;
  - temporary server failure.
- Do not expose internal IDs, secrets, or sensitive diagnostic information.
- Preserve the corrected CRA workflow from #130.

## Acceptance criteria

- The current broken-link scenario is reproduced by an automated test and fixed.
- Copying the displayed signature link into a private/incognito browser opens the expected client-signature page.
- Direct navigation and page refresh on the public signature URL both work.
- The link uses the configured externally reachable base URL.
- A valid token loads the correct immutable CRA summary.
- The recipient can submit the client signature without authenticating.
- Invalid, expired, used, and premature tokens show distinct understandable errors.
- Successful submission updates the CRA state and invalidates/restricts reuse according to policy.
- Backend/API and browser-level tests cover the complete generated-link flow.
