The plan is written to `runs/T023/plan.md`. Here's what it covers:

**New component** — `ValidationModal` (`.tsx`, `.css`, `.test.tsx`) handles the confirmation UX: date input for `providerSignatureDate`, loading/error states, disabled controls during submission.

**Modified** — `CalendarGrid.tsx` gets a "Valider le CRA" button (DRAFT only), a validated banner (VALIDATED only), modal wiring, and a `validating` flag that blocks day-cell clicks during the API call. Tests extended accordingly.

**No changes needed** to the API layer (`validateCra` and `ValidateCraRequest` already exist in `craClient.ts` / `types.ts`), `App.tsx`, or `CraMonthSelector`.
