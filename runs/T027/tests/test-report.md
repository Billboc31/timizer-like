# Test Report — T027

**Verdict: Approve, with scope caveat.** Full report at `runs/T027/tests/test-report.md`.

## Per-criterion results

| # | Criterion | Status |
|---|---|---|
| AC1 | Signature location can be configured | **PASS** (doc-level: property `timizer.provider-signature.path` + env `TIMIZER_PROVIDER_SIGNATURE_PATH`, both verbatim in `docs/provider-signature.md:33-34`) |
| AC2 | PDF generation can access the asset | **NOT VERIFIABLE** — no runtime code on this branch; explicitly deferred to T016 by plan v2 |
| AC3 | Missing asset handled clearly | **PASS** (doc-level: typed error + resolved path + 3 verbatim `reason` codes `missing`/`unreadable`/`unsupported-format` at `docs/provider-signature.md:60-62`) |
| AC4 | Documentation explains how to provide the asset | **PASS** (`docs/provider-signature.md` §6 + `assets/README.md`) |
| AC5 | Existing tests still pass | **PASS (vacuous)** — no test suite exists on this branch |

## Regressions
None. Change is purely additive (4 tracked files + root `.gitignore`).

## Key caveat (not a blocker for the approved plan v2, but travels with the ticket)

Plan v2 reduced T027 to a docs-only convention because the base branch has no backend; the loader + PDF integration is delegated to **T016**. So AC2 is not functionally met on this branch — it's a specification, not runtime behavior. The reviewer accepted this at commit `fd3bb47`. If workflow policy requires the ticket's literal ACs to be functionally verified before close, T027 must not close standalone — it must be paired with T016 delivery.
