The plan is written to `runs/T022/plan.md`. It covers:

- **Backend (2 files)**: Extend `CraDetailsDto` record with 6 provider/client fields, and update `CraDetailsMapper` to map them — these fields exist on the entity but weren't exposed in the DTO.
- **Frontend (5 files)**: Add `@testing-library/react` + `jsdom` deps, mirror the 6 new fields in `types.ts`, create the `CraSummaryPanel` component (pure presentational, props-only), a CSS module, and a Vitest test suite with 4 cases covering loading/error/nominal/reactive-total. The per-file `@vitest-environment jsdom` docblock keeps existing API tests unaffected.
