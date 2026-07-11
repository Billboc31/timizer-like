I've reviewed the ticket, the plan template, and the current state of the worktree (only AI Dev Factory scaffolding — no application code yet). I'll now write the plan directly.

## Objective

Add configurable provider-signature asset support so that PDF generation can locate and load the signature file, and fail clearly (or render a documented placeholder) when the asset is missing. This ticket wires only the asset layer — configuration, loader, error handling, tests, and documentation — not the PDF itself.

## Included

Hypothesis (must be validated by the Coder before starting): the application code targeted by the ticket lives under `src/` in a Node.js / TypeScript stack (implied by the CRA-PDF context and typical Timizer-like stack). If the actual stack differs, the Coder must stop and re-open the plan rather than silently adapt.

Working assumption for the asset layer:

- Configuration key: `PROVIDER_SIGNATURE_PATH` (env var), with a documented default of `assets/provider-signature.png` relative to the project root.
- Supported formats for the MVP: PNG or JPEG (single file, one provider). Any other extension is rejected with a clear error.
- Missing / unreadable asset behavior: PDF generation must fail with a clear, typed error (`ProviderSignatureAssetError`) carrying the resolved path and the reason (missing file, unreadable, unsupported format). No silent fallback in the MVP.

Files to create or modify:

- `src/config/signature.ts` (new):
  - Export `resolveProviderSignaturePath(env = process.env): string` — resolves the configured path, applies the default, normalizes to an absolute path.
  - Export `PROVIDER_SIGNATURE_DEFAULT_PATH` constant.
- `src/assets/providerSignature.ts` (new):
  - Export `class ProviderSignatureAssetError extends Error` with fields `{ resolvedPath, reason }`.
  - Export `loadProviderSignature(env?): Promise<{ path: string; bytes: Buffer; mimeType: 'image/png' | 'image/jpeg' }>` — reads the file, checks the extension/magic bytes, throws `ProviderSignatureAssetError` on any failure.
- `src/pdf/` (only if it already exists): add a thin call site that invokes `loadProviderSignature()` and surfaces the error. If `src/pdf/` does not yet exist in this branch, do **not** create it — this ticket stops at the loader layer and the PDF generator ticket will consume it.
- `assets/.gitkeep` (new): ensures the default assets directory exists; the actual signature PNG is **not** committed.
- `.gitignore`: add `assets/provider-signature.*` so a locally provided signature is never committed.
- `.env.example`: add `PROVIDER_SIGNATURE_PATH=assets/provider-signature.png` with a short inline comment.
- `docs/provider-signature.md` (new): documents (a) where to place the signature file, (b) how to override via `PROVIDER_SIGNATURE_PATH`, (c) supported formats, (d) the failure behavior when the asset is missing, (e) a note that no signature is bundled in the repository.
- `README.md` (if it exists): add a one-line pointer to `docs/provider-signature.md` under a Setup section; skip if there is no `README.md` yet.

Tests to add:

- `src/config/signature.test.ts`:
  - Default path is returned when `PROVIDER_SIGNATURE_PATH` is unset.
  - Custom path is returned when the env var is set.
  - Relative paths are resolved against the project root.
- `src/assets/providerSignature.test.ts`:
  - Loads a small PNG fixture (`src/assets/__fixtures__/signature.png`) and returns bytes + `image/png`.
  - Loads a small JPEG fixture and returns `image/jpeg`.
  - Throws `ProviderSignatureAssetError` with `reason: 'missing'` when the file does not exist.
  - Throws `ProviderSignatureAssetError` with `reason: 'unsupported-format'` for a `.txt` file.

Task ordering (for the Coder):

1. Confirm the stack hypothesis; if wrong, stop.
2. Add `src/config/signature.ts` + tests.
3. Add `src/assets/providerSignature.ts` + tests + fixtures.
4. Add `.env.example`, `.gitignore` entry, `assets/.gitkeep`.
5. Add `docs/provider-signature.md` and README pointer.
6. Run the full existing test suite; ensure no prior test regresses.

## Excluded

- Any actual PDF rendering, layout, or embedding logic (belongs to the PDF generation ticket).
- Drawing signatures in the browser.
- Client-side signature capture or upload.
- Signature verification, tamper-detection, or cryptographic signing.
- Multi-user / per-provider signature selection.
- Email sending or any transport concern.
- Serving the signature via an HTTP endpoint.
- Persisting the signature in a database or object storage.
- Any UI change.

## Acceptance criteria

- Running the app with `PROVIDER_SIGNATURE_PATH` unset resolves to `assets/provider-signature.png` (absolute path relative to project root).
- Running the app with `PROVIDER_SIGNATURE_PATH=/custom/path.png` returns exactly that path from the resolver.
- `loadProviderSignature()` returns the file bytes and a correct MIME type for a valid PNG or JPEG at the resolved path.
- `loadProviderSignature()` throws `ProviderSignatureAssetError` with the resolved path and a specific `reason` when the file is missing, unreadable, or has an unsupported extension; the error message is human-readable and unambiguous.
- `assets/provider-signature.*` is ignored by git and no signature binary is committed to the repository.
- `docs/provider-signature.md` documents the configuration key, default path, supported formats, and the failure behavior, and is discoverable from the README (if a README exists).
- The pre-existing test suite still passes; the new tests for the resolver and loader all pass.
- No production code path outside `src/assets/providerSignature.ts` reads the signature file directly (single access point).
