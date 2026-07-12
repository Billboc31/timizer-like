Plan written to `runs/T022/plan.md`.

Key decisions:

- **Backend DTO extension required**: `CraDetailsDto.java` and `CraDetailsMapper.java` must be extended with six provider/client fields — they exist on the entity but are currently not mapped or exposed. The frontend `types.ts` mirrors this gap.
- **Props-driven component**: `CraSummaryPanel` is a pure presentational component (no fetch, no internal state); the total updates automatically when the parent passes an updated `cra` prop.
- **Testing library gap**: `@testing-library/react` is not in `package.json` yet — the plan includes adding it before writing component tests.
