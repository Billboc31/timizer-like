The plan has been written to `runs/T023/plan.md`. Here's a summary of the key decisions:

**3 files to create, 1 to modify:**

1. **`ConfirmDialog` component** (new) — standalone modal overlay with title/message/confirm/cancel, no external UI library
2. **`CraPage` component** (new) — loads CRA via `getCra`, renders `CalendarGrid`, shows validate button (DRAFT) or validated badge (VALIDATED), orchestrates the confirm → API → state-update flow
3. **`App.tsx`** (modified) — adds `openedCraId` state and swaps `console.log` for rendering `CraPage`

**Key constraints honored:**
- `providerSignatureDate` auto-set to today's date (client signature is out of scope)
- No changes to `CalendarGrid` or `CraMonthSelector` (both already correct)
- Backend endpoint is pre-existing; only UI wiring needed
- Tests cover: visibility, confirm/cancel, API args, success locking, error display
