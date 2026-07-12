The plan has been written to `runs/T022/plan.md` with the four required headings (`## Objective`, `## Included`, `## Excluded`, `## Acceptance criteria`).

Key decisions captured in the plan:
- **Backend**: `CraDetailsDto` needs 6 new provider/client fields; `CraDetailsMapper` populates them; existing test call sites need updating.
- **Frontend**: No frontend exists yet — the Coder scaffolds a React app under `frontend/`, adds an API client (`craClient.js`), a `CraSummaryPanel` component, and wires it in `App.jsx` with loading/error/total-update state.
- **Hypothesis flagged**: frontend framework choice (Vite recommended) is left to the Coder since no scaffold exists.
