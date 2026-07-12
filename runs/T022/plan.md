The plan has been written to `runs/T022/plan.md`. It covers:

- **Backend DTO** (`CraDetailsDto.java`): add six provider/client record components.
- **Backend mapper** (`CraDetailsMapper.java`): populate the new fields from `MonthlyCraReport`.
- **4 test files**: fix direct `new CraDetailsDto(...)` call sites that will break after the record gains new components.
- **Frontend API client** (`craClient.js`): `getCra()` and `updateDay()` wrappers over `fetch`.
- **New component** (`CraSummaryPanel.jsx` + `.css`): renders period, status, total, provider, and client with loading/error/empty states.
- **`App.jsx` wiring**: fetch on mount, pass state to the panel, expose `handleDayUpdate` callback so the panel's total re-renders automatically when a future CalendarGrid updates a day.
