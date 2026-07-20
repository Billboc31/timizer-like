Plan written to `runs/T023/plan.md`. Key decisions:

- **New `ConfirmationModal` component** (vanilla React, no library) with `onConfirm`/`onCancel`/`isLoading` props.
- **`CalendarGrid` gets a `onValidated` callback prop** and a "Valider le CRA" button visible only in DRAFT state.
- **`providerSignatureDate` auto-filled with today's date** — no date picker (out of scope per ticket).
- **`validateCra` in `craClient.ts` is already implemented** — no API layer changes needed.
- **11 test cases** split between the two components.
