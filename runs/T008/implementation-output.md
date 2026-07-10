Implementation complete.

## Changes summary

Added the MVP product scope document as the functional reference for future implementation tickets. No source code, config, or dependencies touched.

## Files created

- `docs/product-scope.md` (45 lines) — Context, MVP scope, Out of scope (MVP), Target stack, Notes
- `docs/README.md` (3 lines) — one-line index entry linking to `product-scope.md`

## Verifications

- All five plan sections present with equivalent titles
- MVP scope list covers all eight required items (single user, single client, one CRA/month, day-by-day entry, CRA validation, PDF with provider signature, CRA history, PDF download)
- Client signature workflow explicitly marked as **phase 2** in Out of scope
- Target stack explicitly names **React**, **Spring Boot**, **SQLite**
- No existing file under `ai/`, `prompts/`, `tickets/`, `runs/` modified
- Document is 45 lines, well under the ~100-line ceiling

## Known limits

- No `docs/README.md` existed prior, so I created it per the plan's fallback branch rather than extending an existing index.
