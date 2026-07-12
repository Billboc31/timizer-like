Conflicts resolved and committed. Summary of what was done:

- **`frontend/src/App.tsx`**: Merged HEAD's `CraSummaryPanel` with T025's `CraHistory` and navigation — both views coexist under a nav toggle, and selecting a CRA from either view sets the summary state.
- **`frontend/src/api/cra.ts`**: Kept HEAD's `fetchCra` alongside T025's new `listCras`, `downloadCraPdf`, and `createCra`, all using a shared `API_BASE_URL`.
- **`frontend/src/vite-env.d.ts`**: Added the standard Vite env types file to fix the `import.meta.env` TS error introduced by T025's code.
- **`runs/T025/state.json`**: Transitioned back to `TEST_COMPLETE`.
