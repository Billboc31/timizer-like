## Objective

Introduce a backend domain entity representing a single calendar day entry within a monthly CRA, holding the date, an allowed work value (0, 0.5, or 1), and an optional note, with validation preventing invalid work values.

## Included

- Create a new CRA day entry entity file in the backend domain layer (e.g. `backend/src/domain/cra/CraDayEntry.<ext>` — exact path aligned with the current backend module layout discovered at implementation time).
  - Fields:
    - `id` (entity identifier consistent with existing entities)
    - `monthlyCraId` (foreign reference to the monthly CRA it belongs to)
    - `date` (calendar date, no time component)
    - `workValue` (must be one of `0`, `0.5`, `1`)
    - `note` (optional string, may be empty or null)
  - Constructor / factory enforcing:
    - `workValue` restricted to the set `{0, 0.5, 1}` — any other value raises a domain validation error.
    - `date` is a valid calendar date.
    - `note` accepted as empty / null without error.
- Introduce (or reuse) a dedicated validation error type for invalid work values, following the existing error-handling conventions of the backend domain layer.
- Reference the `monthlyCraId` as a plain identifier link (no ORM relationship wiring, no persistence layer changes).
- Add unit tests covering:
  - Construction with each allowed work value (`0`, `0.5`, `1`) succeeds.
  - Construction with a disallowed work value (e.g. `0.25`, `2`, negative, `NaN`) is rejected.
  - Empty and null notes are accepted.
  - A valid note string is preserved as-is.
  - The `monthlyCraId` link is stored and readable on the entity.
- Follow existing naming, file-layout, and testing conventions already present in the backend domain module.

## Excluded

- Creation or modification of the monthly CRA entity itself (separate ticket).
- Any REST/HTTP endpoint, controller, or DTO for day entries.
- Persistence layer changes: no repository, no ORM mapping, no migration, no database schema.
- Calendar UI or any frontend change.
- PDF generation, expenses, and client signature features.
- Aggregation logic across multiple day entries (e.g. monthly totals).
- Business rules beyond the allowed work-value set (e.g. weekend/holiday handling, per-day uniqueness within a month).

## Acceptance criteria

- A `CraDayEntry` (or equivalently named) entity exists in the backend domain layer with the fields listed above.
- Each instance carries a reference to exactly one monthly CRA via `monthlyCraId`.
- Constructing an entry with `workValue` in `{0, 0.5, 1}` succeeds.
- Constructing an entry with any other `workValue` is rejected via a domain validation error before the instance is usable.
- Constructing an entry with an empty or null `note` succeeds; the note round-trips unchanged when provided.
- New unit tests for `CraDayEntry` pass.
- The pre-existing backend test suite still passes with no regressions.
- No files outside the backend domain layer and its tests are modified.
