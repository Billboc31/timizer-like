package com.timizerlike.cra.pdf.model;

import java.util.List;

public record CraPdfDocument(
        CraPdfSummary page1,
        List<CraPdfDayEntry> page2Days,
        CraPdfSignatures signatures
) {}
