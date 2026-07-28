# T051 — Add provider signature capture and reusable signature settings

**Source**: GitHub Issue #96

## Description

## Context
The provider must be able to sign the monthly CRA before sending it to the client. Signature handling should be available directly inside Timizer-like rather than relying on a manually replaced asset.

## Goal
Allow the provider to create, save, preview, replace, and apply their signature to a CRA.

## Description
Add a provider signature area in settings with support for drawing a signature using pointer or touch input and uploading a supported image file. Store the signature securely in the application data and provide preview, replace, and delete actions.

When the provider signs a CRA, capture the signature image, signer name, and signing timestamp as part of that CRA. A later change to the default signature must not modify previously signed CRAs.

## Out of Scope
- Qualified or advanced electronic signature certification.
- External signature providers.
- Client signature workflow.

## Acceptance Criteria
- [ ] The provider can draw a signature with mouse and touch input.
- [ ] The provider can alternatively upload a supported signature image.
- [ ] Signature preview, replacement, and deletion are supported.
- [ ] Invalid files and oversized files are rejected with clear messages.
- [ ] A provider signature can be applied to an eligible CRA.
- [ ] Signer name and timestamp are stored with the CRA.
- [ ] Previously signed CRAs keep their original signature snapshot.
- [ ] Tests cover drawing or upload, persistence, replacement, deletion, and CRA application.
