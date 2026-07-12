# Conflict Resolution — T019

Resolved at: 2026-07-12

## Summary

All 6 conflicted files resolved. 21 tests pass after resolution.

---

## Files Resolved

### frontend/.gitignore
**Decision**: Kept HEAD (main branch) version.  
**Reason**: HEAD's comprehensive Vite-generated `.gitignore` is a strict superset of T019's minimal version. The `*.local` pattern in HEAD already covers `.env.local` and `.env.*.local` from T019.

### frontend/index.html
**Decision**: T019's `main.tsx` entry point + HEAD's title "Timizer Like".  
**Reason**: T019 converted the project from JavaScript to TypeScript (main.jsx → main.tsx). The `.tsx` entry point is required for the new TypeScript codebase. The project title "Timizer Like" from HEAD is preserved as the more descriptive project name. The favicon reference (HEAD) was dropped since T019 intentionally removed it.

### frontend/package.json
**Decision**: Merged both sides.  
- `name`: "timizer-frontend" (T019 — more descriptive)
- `scripts.build`: "tsc -b && vite build" (T019 — correct for TypeScript)
- `scripts.lint`: "oxlint" (HEAD — retained)
- `dependencies`: HEAD's newer react 19.2.7
- `devDependencies`: HEAD's newer versions (vite 8, vitest 4, typescript 7, oxlint, @vitest/coverage-v8) PLUS T019's testing-library packages (@testing-library/react, @testing-library/jest-dom, jsdom) which are required by the ticket's test suite.

**Reason**: HEAD has newer package versions; T019 has the testing infrastructure needed for the CraMonthSelector tests. Both are required for a complete, working codebase.

### frontend/package-lock.json
**Decision**: Regenerated via `npm install` after resolving package.json.  
**Reason**: Lock file conflicts are mechanical — regeneration is always correct after resolving the source package.json.

### frontend/src/index.css
**Decision**: Kept HEAD version (`:root` + `body`).  
**Reason**: HEAD's version is a superset. The `:root` font-family declaration applies to `body` via CSS cascade, making T019's `font-family: sans-serif` on `body` redundant.

### frontend/tsconfig.json
**Decision**: Kept T019's references-based config.  
**Reason**: T019 added `frontend/tsconfig.app.json` and `frontend/tsconfig.node.json` as part of its TypeScript migration. The references-based tsconfig.json is the correct root for this split-config setup. HEAD's single-file tsconfig is superseded.

---

## Known Limitations

None. All acceptance criteria from the ticket are met and the full test suite passes.
