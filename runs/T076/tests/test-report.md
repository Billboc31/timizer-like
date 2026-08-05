---

**Test report: APPROVED**

All 5 acceptance criteria pass. Here's the summary:

| Criterion | Status |
|-----------|--------|
| No panel appears automatically at the bottom of pages | PASS |
| Panel hidden on Home / History / Settings / CRA creation | PASS |
| Intentionally opened view can be closed (×, Escape, backdrop) | PASS |
| Closing clears the open state | PASS |
| Existing CRA detail access — no regression | PASS |

**Test run:** 288 tests across 32 files, all green.

The fix is minimal and correct: moving `display: flex; flex-direction: column` from the unconditional `.cra-detail-modal` selector to `.cra-detail-modal[open]` restores the native `<dialog>` hide-when-closed behaviour. The `<dialog>` element remains in the DOM when closed (by design, as scoped in the plan), but it is invisible and inert. Report written to `runs/T076/test-report.md`.
