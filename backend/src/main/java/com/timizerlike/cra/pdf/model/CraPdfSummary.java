package com.timizerlike.cra.pdf.model;

import java.math.BigDecimal;
import java.time.YearMonth;

public record CraPdfSummary(
        YearMonth period,
        CraPdfParty provider,
        CraPdfParty client,
        BigDecimal totalWorkedDays
) {}
