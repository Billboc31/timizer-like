# T053 — Create a secure public client-signature link for a CRA

**Source**: GitHub Issue #98

## Description

## Context
After the provider signs a CRA, the client should be able to review and sign it without needing an application account.

## Goal
Generate a secure, limited public link giving the configured client contact access to one specific CRA.

## Description
Add backend support for creating a cryptographically strong, non-guessable signature token linked to a single CRA. Expose a public read-only endpoint and frontend route that display the CRA period, provider, client, worked-day total, daily details, and provider signature.

The link must expire or become unusable after the client signs, and it must be revocable and regenerable by the provider. Do not expose internal database identifiers or unrelated CRA data.

## Out of Scope
- Sending the link by email.
- Client authentication accounts.
- Client signature capture itself.

## Acceptance Criteria
- [ ] A provider-signed CRA can generate a non-guessable client-signature link.
- [ ] The public link exposes only the associated CRA data required for review.
- [ ] Draft or unsigned CRAs cannot generate a client link.
- [ ] The provider can revoke and regenerate the link.
- [ ] Expired, revoked, invalid, and already-used links show a safe user-facing message.
- [ ] Tokens are not stored or logged in plain text where avoidable.
- [ ] Automated security and integration tests cover valid and invalid link access.
