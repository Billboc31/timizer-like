Plan written to `runs/T023/plan.md`. Key decisions reflected:

- `ConfirmDialog` is a new standalone component (no UI library in the project) with its own CSS and tests
- The validate button lives in `CalendarGrid.tsx` — only visible when `status === 'DRAFT'`
- `providerSignatureDate` is auto-set to today's date (ISO `YYYY-MM-DD`) since "Client signature" is explicitly out of scope
- The existing `day-cell--locked` / `isValidated` infrastructure already handles visual locking — no changes needed there
- 6 test cases cover the full confirmation flow including cancel, success, and error paths
