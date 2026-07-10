Review-attempt-6 written to `runs/T027/reviews/review-attempt-6.md`.

**Decision: `IMPLEMENTATION_FIX_REQUIRED`** (0/5 acceptance criteria met after 4 Coder attempts + 6 reviews).

Key findings:
- The Coder correctly halted again (attempt 4, « halt terminal »), honoring the plan's auto-stop clause: plan targets a Node/TS stack that doesn't exist on this branch; real stack (Spring Boot Java per T009, React per T010) isn't merged.
- **Progress vs review-5**: the review-on-review sub-loop is broken this tour — a Coder step *did* intercalate (`f3a0975`, 15:41:00Z). But no application code was produced (0 fichier applicatif hors `runs/T027/`).
- **Plan never replayed**: `git diff 865a769 HEAD -- runs/T027/plan.md` still empty after 6 reviews — mechanical root cause of the halt loop.
- **P0 escalation maintained**: manual Planner replay required (or explicit docs-only scope arbitration if T027 must land before T009); two harness bugs to log outside T027 (`FIX_REQUIRED` routes to coder instead of planner; no progress guard against 4 consecutive identical halts).
- No security regression, no scope drift, no secret exposure — the Coder's halt is correct at the role level.
