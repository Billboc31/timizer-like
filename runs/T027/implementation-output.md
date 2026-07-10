## Halt report — T027 (attempt 2)

**STOPPED — no code, config, docs, or state mutated.** The plan has not been revised since attempt 1, so its own auto-halt clause fires again for the same two reasons:

1. The plan still hypothesizes a **Node.js / TypeScript** stack under `src/`, but per `ticket/T009` the backend is **Spring Boot / Java** under `backend/`, and per `ticket/T016` the PDF generator (which will consume this signature asset) lives there — a `src/…/*.ts` loader would be dead code.
2. There is still **no project to plug into**: no `pom.xml`, no `package.json`, no `src/` on `main`; T009 and T010 are unmerged.

The attempt-1 review itself concluded *"Rien à corriger côté Coder : sa décision d'arrêt est conforme. La balle est chez le Planner."* — the fix owner is the Planner. `git log` confirms no planner step ran between attempt 1 and this retry, and `plan.md` is byte-identical.

Silently rewriting the plan into Java on the Coder side would violate the plan's self-arrest clause, `refactor-safety`, and `workflow-discipline`, and risk merge conflicts on `backend/pom.xml` when T009 lands.

### Files touched

- `runs/T027/implementation-output.md` — rewritten to record the attempt-2 halt and escalate.

### Escalation

Two consecutive halts on the same unrevised plan. This should route back to the **Planner** (not another Coder retry) to re-issue the plan against the real Spring Boot stack — or explicitly downscope T027 to docs-only deliverables so it can land ahead of T009 — per the attempt-1 review's "Actions demandées" list.
