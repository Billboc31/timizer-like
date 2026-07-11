## Summary

Implemented T030 per the approved plan. Documentation-only change; no application code, config, or asset touched.

### Files created

- `README.md` — repo-root entry point with the eight ordered sections required by the plan (Project overview → Troubleshooting), naming the exact backend/frontend/test commands from the acceptance criteria.
- `docs/local-development.md` — reference doc with the ten ordered sections. Includes the SQLite override, `timizer.cra.*` namespace, `timizer.provider-signature.path` / `TIMIZER_PROVIDER_SIGNATURE_PATH`, default `assets/provider-signature.png` path, and PNG/JPEG formats.
- `runs/T030/implementation-output.md` — verification output, file list, and explicit note that no application test suite exists on this branch.

### Files intentionally not modified

- `docs/ai/global-context.md` — the plan authorised a one-line pointer only if a natural anchor exists; the file's current sections ("Project" metadata, "AI Dev Factory" scaffolding) offered none, so it was left as-is per the plan's fallback instruction.

### Verifications

- Assumption 1 check passed: `git ls-files | grep -Ev "^(ai|prompts|tickets|docs/ai/|runs/|\.gitignore$)"` returned empty — no application files on the base branch, so the docs reference upstream conventions rather than fabricated ones.
- No tests were executed: no application test suite exists on this branch.

### Limitations

- Default HTTP/dev ports are described as "the default defined by T009/T010" rather than concrete numbers, because those values are not readable from any file on the base branch. The plan explicitly allowed this phrasing.
- No external URLs are fabricated — install sources are named ("official OpenJDK distribution", "official Node.js site") without links.
