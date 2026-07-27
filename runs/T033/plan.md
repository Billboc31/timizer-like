## Objective

Systematically inspect every user flow and route of the running React application, then produce and commit a prioritized Markdown defect report covering layout issues, interaction bugs, console errors, network failures, and accessibility violations — without changing any application behaviour.

## Included

**New artifact to create**
- `docs/audit/T033-ui-defect-report.md` — structured defect report containing, for each finding: affected route/component, reproducible steps, expected vs actual behaviour, severity (blocker / major / minor / cosmetic), screenshot reference (when applicable), and suggested follow-up ticket title.

**Inspection scope** (read-only; no code edits)
- `App.tsx` — root navigation logic, initial view state, error boundaries if any.
- `CraMonthSelector` — month/year picker: rendering, keyboard nav, boundary months, locale display.
- `CalendarGrid` — day selection, disabled states, weekend handling, multi-select if present.
- `CraSummaryPanel` — computed totals, empty state, overflow at extreme values.
- `CraValidation` — form field states, validation messages, submit flow, loading/error feedback.
- `CraHistory` — list rendering, empty state, pagination/scroll if present, PDF download trigger.
- API client layer (`craClient.ts`, `httpClient.ts`) — observable network calls only; no source edits.

**Capture checklist during manual run**
- Browser console: errors, warnings, React hydration warnings, prop-type violations.
- Network panel: failed requests, unexpected 4xx/5xx, missing auth headers.
- Responsiveness: breakpoints at 375 px, 768 px, 1280 px.
- Accessibility: missing labels, contrast issues, focus traps, keyboard-only flow.

**Steps**
1. Start backend (`localhost:8081`) and frontend (`npm run dev` in `frontend/`).
2. Walk each view in order: selector → CalendarGrid interaction → CraSummaryPanel → CraValidation submit → CraHistory → PDF download.
3. Record every observable defect using the structured format defined in the ticket.
4. Capture console/network state at each step.
5. Assign severity to each entry: blocker, major, minor, cosmetic.
6. Write `docs/audit/T033-ui-defect-report.md`.
7. Commit the report file on the current branch.

## Excluded

- Any code modification (component, style, config, test).
- Backend bug fixes or API changes.
- Component redesign or UX proposals beyond noting defects.
- Automated test creation (E2E, visual regression).
- Infrastructure or CI changes.

## Acceptance criteria

- `docs/audit/T033-ui-defect-report.md` exists and is committed on the branch.
- Every view and user flow listed under **Inspection scope** has at least one entry (even if "no defect found").
- Each defect entry contains: route/component, reproducible steps, expected behaviour, actual behaviour, severity label.
- Browser console errors and failed network requests sections are present in the report.
- Findings are sorted or grouped by severity (blockers first).
- No file outside `docs/audit/` is modified by this ticket.
