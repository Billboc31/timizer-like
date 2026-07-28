# T058 — Use a rectangular provider signature box in the CRA UI and PDF

**Source**: GitHub Issue #103

## Description

## Context
The provider signature area should feel like a clear document-signing zone. A rectangular box is preferred for the provider signature instead of a loosely positioned image or generic control.

## Goal
Create a consistent rectangular signature block for the provider in both the CRA interface and generated PDF.

## Description
Design a bordered rectangular signature area with a restrained document-like appearance. In the CRA interface, the box must show an empty state inviting the provider to sign, a preview of the stored or captured signature, signer name, and signing date when signed. It must remain large enough for a natural handwritten signature and work with mouse and touch input.

Use the same visual concept in the PDF: a clearly labelled rectangular provider signature block containing the signature, signer name, and date. Preserve signature aspect ratio and add internal padding so the signature never touches or crosses the border.

The client signature area should use a matching rectangular layout when client signature support is implemented, so both parties' blocks align cleanly.

## Out of Scope
- Qualified electronic signature certification.
- Changing signature workflow states.
- Introducing decorative handwritten fonts.

## Acceptance Criteria
- [ ] The provider signature area is a clearly bordered rectangle in the CRA interface.
- [ ] The empty state clearly invites the provider to sign.
- [ ] The signed state displays the signature, signer name, and signing date.
- [ ] The signature preserves its aspect ratio and remains inside the box with adequate padding.
- [ ] The box works correctly on desktop and mobile and supports touch signing.
- [ ] The PDF uses a matching rectangular provider signature block.
- [ ] The future client block can align beside or below it using the same dimensions and visual language.
- [ ] Component, responsive, and PDF rendering tests cover empty and signed states.
