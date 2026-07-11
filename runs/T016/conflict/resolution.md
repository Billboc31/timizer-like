The T016 branch conflict is fully resolved. Here's what happened:

- The rebase had an add/add conflict in `backend/pom.xml` — our T016 coder commit added pdfbox 3.0.3, while `origin/main` had added spring-boot-starter-web, data-jpa, validation, and h2 since the branch was cut.
- A Git 2.50.1 bug on Apple prevented `git rebase --continue` from working after manually committing the resolution, so I aborted the stale rebase and ran a clean `git rebase origin/main`.
- Resolution: all of main's new dependencies were preserved, and pdfbox 3.0.3 was inserted before `spring-boot-starter-test`.
- Branch pushed force-with-lease; state transitioned to `CONFLICT_RESOLVED_REVIEW_NEEDED` (pending human review gate).

Pass 2 resolution (conflict-resolver-attempt-3):
- Residual conflict markers in `runs/T004/prompts/conflict-resolver-attempt-1.md` and `runs/T004/prompts/conflict-resolver-attempt-2.md` were cleaned up.
- These are runtime artifact/snapshot files; conflicts arose from T004 coder commit (`31adddd`) vs HEAD for Java code sections, and from T027 coder commit (`02f00a8`) vs HEAD for .gitignore additions.
- Java code conflicts: kept HEAD version (more complete, with validation annotations and unique constraints).
- .gitignore conflicts: combined both versions (SQLite db ignores + provider-signature asset ignores).
