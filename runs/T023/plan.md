Plan written to `runs/T023/plan.md`.

Key decisions:
- **New `CraView` component** loads full CRA via `getCra(id)`, renders `CalendarGrid` + validate controls
- **Inline confirmation** (no modal library — none exists in the project)
- **`providerSignatureDate`** auto-set to today's ISO date — the ticket doesn't ask for user input and "client signature" is explicitly out of scope
- **`App.tsx`** wired to show `CraView` when a CRA is opened (replaces the console.log stub)
- **Risk noted:** `getCra` backend endpoint is marked as pending in the API client comment; tests must mock it
