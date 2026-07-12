The plan is written to `runs/T022/plan.md`. Key decisions reflected in it:

- **Backend change required**: `CraDetailsDto` currently lacks provider/client fields — the plan extends it and updates `CraDetailsMapper` to concatenate first/last names into `providerName` and `clientName`.
- **Three new frontend files**: `api/cra.js`, `CraSummaryPanel.jsx`, updated `App.jsx`.
- **No test framework**: the base branch has none; adding it is out of scope. Loading/error states are verified by inspection.
- **"Total updates" criterion**: satisfied by standard React prop reactivity — no special wiring needed since the panel reads `totalWorkedDays` from props.
