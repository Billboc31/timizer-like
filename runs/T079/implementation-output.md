All 294 tests pass across 32 files. Both fixes are done:

1. **`CraDetailsMapper.java` line 54** — `FULLY_SIGNED → CraStatus.VALIDATED` (was incorrectly mapped to `AWAITING_CLIENT_SIGNATURE`). Both are non-deletable terminal states, and `VALIDATED` is semantically accurate as "finalized".

2. **`httpClient.ts` line 22** — `'cra_not_deletable'` added to the `known` array so the 409 error from the backend now surfaces the correct French message instead of the generic fallback.
