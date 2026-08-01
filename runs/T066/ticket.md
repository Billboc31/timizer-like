# T066 — Redesign the client CRA signature page

**Source**: GitHub Issue #129

## Description

## Objective

Redesign the client CRA signature page so it is visually polished, trustworthy, responsive, and straightforward to use.

## Context

The current client signature page is difficult to use and visually poor. This is a client-facing validation screen and must look professional on desktop and mobile.

This ticket concerns the complete client-facing experience, not only the drawing canvas.

## Requirements

### Page structure

- Present a clean branded page with:
  - company/application identity;
  - CRA title and reference;
  - consultant/provider name;
  - client name when available;
  - covered period;
  - total worked days and duration;
  - current validation status.
- Provide a readable summary before requesting the signature.
- Clearly explain what signing means.
- Remove technical, internal, or developer-oriented information from the client view.

### Signature experience

- Provide a large, clearly bordered signature pad with an explicit label.
- Support mouse, touch, and stylus through Pointer Events.
- Prevent page scrolling while the user is actively signing on touch devices.
- Preserve smooth strokes and correct coordinates after responsive resizing.
- Provide visible actions:
  - `Effacer`;
  - `Signer et valider le CRA`.
- Disable submission until a non-empty valid signature is present.
- Show validation progress and prevent double submission.
- Display useful inline error messages without losing the drawn signature when retry is possible.
- Show a clear success screen after signature with the validation date and a PDF download action.

### UX and accessibility

- Use a centered card/layout with balanced spacing, typography, and visual hierarchy.
- Make the primary validation action visually obvious.
- Ensure adequate contrast and visible focus states.
- Associate every input and action with accessible labels.
- Support keyboard navigation for all non-drawing controls.
- Provide a clear message for expired, invalid, already-used, or already-signed links.
- Keep the page usable on small mobile screens without horizontal scrolling.

## Acceptance criteria

- The signature page has a professional client-facing design on desktop and mobile.
- CRA identity, period, consultant, and totals are visible before signing.
- Signing works with mouse, touch, and stylus.
- The signature pad remains correctly aligned after viewport changes.
- The validation button cannot be used with an empty signature.
- Double submission is prevented.
- Errors are understandable and do not unnecessarily erase the signature.
- A successful signature displays confirmation and access to the finalized PDF.
- Expired and already-signed links have dedicated, understandable states.
- Existing signature-link security remains intact.

## Relationship to existing work

This ticket improves the client UI delivered around #117 and must remain compatible with the two-party signing workflow and the finalized PDF signature rendering tickets.
