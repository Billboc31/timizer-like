Plan written to `runs/T025/plan.md`. Key decisions:

- **No routing library**: the project has none today; a view-state variable in `App.tsx` keeps scope minimal.
- **`CraSummaryDto` extension**: `validationDate` is missing from the summary type but required by the ticket — flagged and included.
- **PDF download**: uses the existing `downloadCraPdf()` client function, gated on `status === 'VALIDATED'`.
- All backend work (list endpoint, PDF endpoint) is explicitly excluded.
