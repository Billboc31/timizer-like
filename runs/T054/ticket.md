# T054 — Add client signature capture and approval page

**Source**: GitHub Issue #99

## Description

## Context
The client must be able to review and sign the provider-signed CRA from the secure public link.

## Goal
Provide a simple, professional client approval and signature experience without requiring an account.

## Description
Extend the public CRA review page with client signer name, optional role, explicit approval consent, and a touch- and mouse-compatible signature pad. Require the client to confirm that they approve the displayed CRA before submission.

On successful submission, store a snapshot of the signature, signer identity, signing timestamp, and the CRA content version that was approved. Mark the token as consumed and transition the CRA to fully signed.

## Out of Scope
- Legally qualified electronic signature.
- Editing the CRA from the public page.
- Rejecting with a threaded discussion workflow.

## Acceptance Criteria
- [ ] The client can review the complete CRA before signing.
- [ ] Signer name and explicit approval consent are required.
- [ ] Signature capture works with mouse and touch.
- [ ] Empty or invalid signatures cannot be submitted.
- [ ] Successful signing stores signer identity, signature, timestamp, and approved CRA snapshot.
- [ ] The same token cannot be used to sign twice.
- [ ] The client receives a clear success confirmation.
- [ ] Mobile, component, integration, and end-to-end tests cover the workflow.
