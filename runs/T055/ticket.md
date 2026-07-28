# T055 — Generate the final CRA PDF with provider and client signatures

**Source**: GitHub Issue #100

## Description

## Context
Once both parties have signed, the downloadable CRA PDF must contain the complete and immutable approval record.

## Goal
Produce a final professional PDF containing both signatures and their associated signer information.

## Description
Update the PDF generation model and layout to render the provider signature and client signature in their respective signature areas. Include signer names and signing dates, while preserving the monthly summary and daily detail pages.

The final PDF must be generated from the signed CRA snapshot rather than mutable current settings. Before the client signs, the PDF may show the provider signature and a clear pending-client-signature state. After both signatures, the final document must be stable across repeated downloads.

## Out of Scope
- Cryptographic PDF certificates.
- Third-party electronic-signature standards.
- Emailing the PDF.

## Acceptance Criteria
- [ ] A provider-signed PDF displays the provider signature and a pending client area.
- [ ] A fully signed PDF displays both signatures, signer names, and signing dates.
- [ ] Provider and client identity data comes from the CRA snapshot.
- [ ] Signatures preserve their aspect ratio and remain legible.
- [ ] Repeated downloads of an unchanged fully signed CRA produce equivalent content.
- [ ] Missing or corrupt signature data is handled safely.
- [ ] PDF integration tests verify both provider-only and fully signed variants.
