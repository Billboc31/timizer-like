18/18 tests pass. The fix is applied and verified.

**What was changed:** In `CraPdfGenerator.java` lines 473–481, after the new page is opened for the signature block overflow case, I added:

```java
drawText(cs, bold, 11f, MARGIN, y, "Signatures — " + yearMonth.format(PERIOD_FORMAT_LONG));
y -= 18f;
```

This ensures that when a month's signature block is pushed to a new page due to insufficient space, the page opens with a clearly labelled heading (e.g. `"Signatures — juillet 2026"`) that unambiguously ties the signature boxes to their month — satisfying the blocked acceptance criterion.
