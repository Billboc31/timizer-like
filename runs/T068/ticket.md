# T068 — Render stored consultant and client signatures in CRA PDFs

**Source**: GitHub Issue #131

## Description

## Objective

Render the actual stored consultant and client signatures in the generated CRA PDF, with signer identity and signature timestamps.

## Current problem

Signatures collected in Timizer still do not appear in the generated PDF. Previous issues focused on adding blank signature areas, but the finalized PDF must embed the signatures that were actually captured during the validation workflow.

## Requirements

- Load the stored consultant and client signature data when generating the PDF.
- For each detailed monthly CRA section, render two clearly separated blocks:
  - consultant/provider signature;
  - client signature.
- When a signature exists, render:
  - the signature image/strokes;
  - signer name;
  - signing date and time;
  - role label;
  - validation wording for the client.
- Preserve the signature aspect ratio and prevent stretching, clipping, or excessive scaling.
- Use a white or transparent background compatible with print.
- Keep both blocks associated with the correct monthly details.
- Do not split a signature block across pages.
- For a fully validated multi-month CRA, repeat the relevant two signatures on each detailed monthly section as required by #128.
- If the PDF is generated before the workflow is complete:
  - clearly display the missing signature as `En attente de signature`;
  - never fabricate an image or signing date.
- Regenerate/download the final PDF using the latest valid signed CRA revision.
- Ensure an edit that invalidates signatures also removes them from subsequently generated PDFs.
- Do not expose raw signature storage paths, tokens, or internal identifiers in the PDF.

## Data integrity and security

- Verify that both signatures belong to the CRA revision being rendered.
- Do not render stale signatures captured before a subsequent CRA modification.
- Validate supported image/data formats before embedding.
- Fail safely with a useful diagnostic when stored signature data is corrupted.
- Keep signature access server-side and authorized.

## Acceptance criteria

- After consultant signature, the generated PDF displays the consultant signature and marks the client signature as pending.
- After client signature, the PDF displays both actual signatures.
- Signer names, roles, and timestamps are correct.
- The final PDF corresponds to the same CRA revision signed by both parties.
- Signatures remain sharp, proportional, and readable on A4.
- Multi-month PDFs show the two signature blocks for every detailed month.
- Missing signatures are represented as pending, never as fake or blank validated signatures.
- Editing and returning the CRA to `DRAFT` removes invalidated signatures from newly generated PDFs.
- Corrupted signature data produces a controlled error rather than a broken or partially misleading PDF.
- Existing CRA entries, totals, and annual/monthly overview pages remain unchanged.

## Relationship to existing work

This ticket completes #117 and #128 by embedding captured signatures rather than only rendering empty handwritten-signature boxes.
