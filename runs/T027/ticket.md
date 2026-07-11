# T027 — Create provider signature asset support

**Source**: GitHub Issue #27

## Description

## Context

The generated CRA PDF must include the provider signature in the MVP.

## Goal

Support storing and using a provider signature asset.

## Description

Add support for a local provider signature image or equivalent signature asset used during PDF generation.

The signature asset location must be configurable and documented.

If no signature asset is available, PDF generation must fail clearly or render a documented placeholder.

## Out of Scope

- Drawing signatures in the browser
- Client signature
- Signature verification
- Multi-user signatures
- Email sending

## Acceptance Criteria

- Provider signature asset location can be configured
- PDF generation can access the provider signature asset
- Missing signature asset is handled clearly
- Documentation explains how to provide the signature asset
- Existing tests still pass
