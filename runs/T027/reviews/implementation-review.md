Review written for T027 attempt 3.

**Summary:** Third consecutive Coder halt on a byte-identical `plan.md` (still on the single commit `865a769`, no Planner step intercalated). The Coder's halt is correct — it honors the plan's own auto-stop clause and does not silently translate the Node/TS plan into Java for the actual Spring Boot backend. Zero acceptance criteria are met after three attempts.

**Key escalation vs. review-2:** the routing loop `IMPLEMENTATION_FIX_REQUIRED → step: coder → halt` is now confirmed by three identical reproductions — no longer a prediction. Priority 0 is a new-flavored action: block automatic Coder retries while `plan.md` is byte-identical to `865a769`, force a Planner step, and log the harness routing bug as a separate workflow ticket. Priority 1 remains the 8 replan actions from attempt-1 (Spring Boot layout, T009 dependency, `@ConfigurationProperties`, Maven fixtures, docs, etc.).

**Files written:**
- `runs/T027/reviews/review-attempt-3.md` — full structured review
- `runs/T027/reviews/implementation-review.md` — attempt-3 summary

Decision: `IMPLEMENTATION_FIX_REQUIRED`.
