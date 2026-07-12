The plan is written to `runs/T022/plan.md`. Here is a summary of what it covers:

**Backend (2 files)**
- `CraDetailsDto.java` — add 6 provider/client fields (they exist on the entity but aren't exposed)
- `CraDetailsMapper.java` — map those 6 fields

**Frontend (5 files)**
- `package.json` — add `@testing-library/react` (missing dep)
- `api/types.ts` — mirror the 6 new DTO fields
- `CraSummaryPanel.tsx` — pure presentational component, props-only (`cra`, `loading`, `error`), no fetch/state
- `CraSummaryPanel.module.css` — plain CSS module (consistent with existing style convention)
- `CraSummaryPanel.test.tsx` — vitest + testing-library tests for all four states: loading, error, nominal render, reactive total update
