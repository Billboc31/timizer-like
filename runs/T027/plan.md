## Objective

Deliver the documented convention, repo-hygiene rules, and directory skeleton that the CRA PDF generator (owned by T016) will consume to embed the provider signature. Because the T027 base branch (`ai-dev-factory/bootstrap-agent-layout`) contains no backend and neither T009 nor T016 is merged into it, the loader implementation and its unit tests are explicitly deferred to T016; T027 lands only the parts that can safely ship independently of the backend.

## Included

Working assumption (must be validated by the Coder before starting):

- The branch checkout has no `backend/`, no `src/`, no `pom.xml`, no `package.json`, and no application source tree. Command to verify: `git ls-files | grep -Ev "^(ai|prompts|tickets|docs/|runs/|assets/|\.gitignore$)"` must return empty apart from files this plan itself introduces. If any application tree already exists (T009 has been merged into the T027 base), the Coder must **stop and request a replan** — this plan is intentionally scoped to avoid touching `backend/` to prevent conflicts with T009.

Convention to document (this is the substance of the ticket):

- Default asset location: `assets/provider-signature.png` (path is relative to the project root).
- Also accepted extensions: `.jpg`, `.jpeg`.
- Override mechanism (specified for T016 to implement — not implemented here):
  - Spring property key: `timizer.provider-signature.path`
  - Environment override: `TIMIZER_PROVIDER_SIGNATURE_PATH`
- Missing / unreadable / unsupported-format behavior: PDF generation **must fail** with a typed error carrying (a) the resolved absolute path and (b) a machine-readable `reason` code chosen from `missing`, `unreadable`, `unsupported-format`. No silent fallback and no placeholder in the MVP.
- Non-commit rule: the signature binary must never be committed to the repository.
- Single access point: only the future `ProviderSignatureLoader` (T016) may read the file at runtime.

Files to create or modify:

- `docs/provider-signature.md` (new) — sections in this order:
  1. Purpose (why the CRA PDF needs it, link to ticket T027 and consumer T016).
  2. Default location (`assets/provider-signature.png`).
  3. Override (Spring property `timizer.provider-signature.path`; env `TIMIZER_PROVIDER_SIGNATURE_PATH`).
  4. Supported formats (PNG, JPEG only; explicit reject of other extensions).
  5. Missing-asset behavior (typed error + resolved path + `reason` code; no silent fallback).
  6. Non-commit rule and how to provide the file locally.
  7. Consumers — T016 will implement the loader, single access point.
- `assets/.gitkeep` (new) — ensures the default directory exists on a fresh checkout.
- `assets/README.md` (new) — short pointer to `docs/provider-signature.md`; states explicitly that no signature binary is committed here.
- `.gitignore` (new at repo root, or extend if it already exists) — add entries `assets/provider-signature.png`, `assets/provider-signature.jpg`, `assets/provider-signature.jpeg`. **Do not** ignore the whole `assets/` directory (that would hide `.gitkeep` and `README.md`).
- `docs/ai/global-context.md` — only add a single-line pointer to `docs/provider-signature.md` **if** there is already a natural "Documentation index" or "Setup" section. If no such anchor exists, skip this file; do not create a new top-level section just to host the pointer.

Explicitly not created by this ticket:

- No file under `backend/`, `src/`, `frontend/`, or any application source tree.
- No Java, Kotlin, TypeScript, or Python source.
- No `application.properties`, no `application.yaml`.
- No `ProviderSignatureLoader`, no `ProviderSignatureProperties`, no `ProviderSignatureAssetException` class.
- No unit tests, no integration tests, no fixture binaries (`.png`, `.jpg`).
- No PR / issue creation, no memory update — those steps are downstream of implementation validation.

Task ordering (for the Coder):

1. Verify branch state matches the working assumption above. If not, stop and request a replan.
2. Create `docs/provider-signature.md` with all seven sections.
3. Create `assets/.gitkeep`.
4. Create `assets/README.md`.
5. Create or extend the root `.gitignore` with the three signature-file entries; verify the whole `assets/` directory is not ignored.
6. If `docs/ai/global-context.md` has an obvious index-style anchor, add a one-line pointer; otherwise skip.
7. Run any pre-existing application test suite. On this branch there is none — the Coder must record that fact explicitly in `runs/T027/implementation-output.md` (with the exact command used).

## Excluded

- Any Java, Kotlin, Spring, or backend code — belongs to T016; blocked on T009 merge.
- Any PDF rendering, layout, or embedding logic — T016.
- Any loader implementation, unit tests, integration tests, or fixture binaries — T016.
- Drawing signatures in the browser (per ticket).
- Client-side signature capture or upload (per ticket).
- Signature verification, tamper-detection, or cryptographic signing (per ticket).
- Multi-user or per-provider signature selection (per ticket).
- Email sending or any transport concern (per ticket).
- Serving the signature via an HTTP endpoint.
- Persisting the signature in a database or object storage.
- Any UI change.
- Committing any real or example signature binary into the repository.
- Memory update, PR opening, or `state.json` mutation — those are downstream harness steps.

## Acceptance criteria

- `docs/provider-signature.md` exists and contains all seven sections listed in Included, in the specified order.
- The document names both override keys exactly: `timizer.provider-signature.path` (property) and `TIMIZER_PROVIDER_SIGNATURE_PATH` (env).
- The document lists the three `reason` codes verbatim: `missing`, `unreadable`, `unsupported-format`.
- The document identifies T016 as the consumer that will implement the loader, so a reviewer can trace the dependency chain.
- `assets/.gitkeep` exists at the repository root.
- `assets/README.md` exists and links to `docs/provider-signature.md`; it explicitly states that no signature binary lives in that directory in the repository.
- The root `.gitignore` contains entries for `assets/provider-signature.png`, `assets/provider-signature.jpg`, and `assets/provider-signature.jpeg`.
- The root `.gitignore` does **not** contain a bare `assets/` or `assets/*` entry that would hide `.gitkeep` or `README.md`.
- `git ls-files | grep -E "^backend/|^src/|^frontend/"` returns empty (this ticket added no application source).
- `git ls-files | grep -Ei 'signature.*\.(png|jpe?g)$'` returns empty (no signature binary committed anywhere).
- `runs/T027/implementation-output.md` records the exact command used to verify the pre-existing test suite (empty on this branch) and its result.
- No file under `runs/T027/memory/` is modified by this ticket (memory update is a downstream step).
