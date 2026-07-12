The plan has been written to `runs/T025/plan.md`. It covers:

- **Objective**: `HistoryPage` component with `useCraHistory` hook, wired to the existing `listCras()` and `downloadCraPdf()` API clients.
- **Included**: 4 new files (page, hook, two test files), 2 modified files (router setup in `main.tsx`, nav link + route in `App`), a `react-router-dom` dependency addition, and a `validationDate` field fix on `CraSummaryDto`.
- **Excluded**: backend work, CRA detail page, PDF generation, search/filters, sidebar navigation.
- **Acceptance criteria**: verifiable conditions covering all ticket acceptance criteria plus TypeScript compilation and test pass.
