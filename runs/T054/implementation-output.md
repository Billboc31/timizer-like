207 tests pass (208 before, minus the 1 removed). Done.

**Change made:** Removed `returns409WhenCraNotInSignedByProviderStatus` from `PublicCraSigningControllerTest.java` (lines 131-140) and its now-unused `CraNotSignedByProviderException` import. The test documented an impossible scenario — `ClientSignatureService.sign()` can never throw that exception; a wrong CRA status at signing time always produces `TokenAlreadyConsumedException` (→ 410), which is already covered by the existing `returns410WhenTokenAlreadyConsumed` test.
