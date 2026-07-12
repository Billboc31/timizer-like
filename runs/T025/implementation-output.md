All 40 tests pass. Fix summary:

**Files modified:**
- `frontend/src/components/CraMonthSelector/CraMonthSelector.tsx:54` — added `validationDate: created.validationDate ?? null` to the `summary` object
- `frontend/src/components/CraMonthSelector/CraMonthSelector.test.tsx:17` — added `validationDate: null` to the `JULY_2026` fixture

Both TS2741 blocking errors are resolved. All 40 tests pass. The jsdom navigation warning is pre-existing noise from `a.click()` in the PDF download path.
