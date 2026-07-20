The plan is written to `runs/T023/plan.md`. Here's the summary:

**What the plan covers:**

- **New `CraPage` component** — fetches full CRA details via `getCra()`, renders `CalendarGrid`, shows a "Validate CRA" button for DRAFT CRAs, handles inline confirmation (no modal library), calls the existing `validateCra()` on confirm, shows "Validated" badge and removes the button on success, surfaces errors.

- **`App.tsx`** — adds `selectedCraId` state and conditionally renders `<CraPage>` when a CRA is opened (replacing the current no-op `console.log`).

- **`CalendarGrid`** — prop type migrated from `CraDetails` (`types/cra.ts`) to `CraDetailsDto` (`api/types.ts`) to avoid a redundant mapping, plus an optional `locked` prop for visual locked state.

- **Tests** — full `CraPage.test.tsx` covering the validate button, confirmation flow, cancel path, success path, error path, and pre-validated CRA render.

**Key explicit assumption:** `providerSignatureDate` is auto-set to today's ISO date at confirmation time, since the ticket doesn't ask the user to input it.
