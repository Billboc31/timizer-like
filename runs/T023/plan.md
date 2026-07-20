Plan written to `runs/T023/plan.md`. Key decisions:

- **New `CraView` component** loads full CRA via `getCra(id)`, renders `CalendarGrid` + inline validate controls
- **Inline confirmation** — no modal library (none exists in the project)
- **`providerSignatureDate`** auto-set to today's ISO date; client signature is explicitly out of scope
- **`CalendarGrid`** gains a `locked` prop to disable day interactions when validated
- **`App.tsx`** replaces the `console.log` stub with state to render `CraView` when a CRA is opened
