# Conflict Resolution — T016 vs main

## Conflicted file: `backend/pom.xml`

**Type:** add/add conflict — both the T016 coder commit and the T004 merge commit added `backend/pom.xml` as a new file.

**Decision:** merge both sets of dependencies.

- `origin/main` side added (via T004→T007): `spring-boot-starter-web`, `spring-boot-starter-data-jpa`, `spring-boot-starter-validation`, `com.h2database:h2` (runtime).
- T016 side added: `org.apache.pdfbox:pdfbox:3.0.3` (required for the PDF generator).

**Resolution:** keep all `origin/main` dependencies and insert the `pdfbox` dependency before `spring-boot-starter-test`. No functionality is lost on either side.

## Files excluded from resolution

`runs/T004/prompts/conflict-resolver-attempt-1.md` and `runs/T004/prompts/conflict-resolver-attempt-2.md` were listed as conflicted in the initial rebase attempt but are runtime artifacts unrelated to T016 code. They resolved cleanly after the rebase was re-run against the updated `origin/main`.

## Rebase notes

The first rebase attempt (onto the T004 HEAD) stalled due to an Apple Git 2.50.1 bug where `git rebase --continue` reported phantom conflicts after a manual `git commit` during conflict resolution. Resolution: aborted the stale rebase and ran a clean `git rebase origin/main`, which completed successfully in one pass.
