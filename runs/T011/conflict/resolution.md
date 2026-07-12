T011 conflict resolution is complete:

- Resolved the git rebase conflict in `runs/T007/state.json` by keeping HEAD's TEST_COMPLETE state
- Dropped all 12 intermediate T007 commits that were conflicting (they're already in the base)
- Restored the missing `GET /api/cra/{id}` and `GET /api/cra/{year}/{month}` endpoints in `CraController.java` (the commit implementing them had been accidentally skipped during the rebase skip loop)
- Added 4 new tests to `CraControllerTest.java` covering both 200 and 404 responses for the GET endpoints
- All 102 backend tests pass
- Branch pushed; PR #48 was already merged and issue #11 is closed
