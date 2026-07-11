package com.timizerlike.cra.model;

import java.time.YearMonth;

public record CraMonthlyReport(
        YearMonth month,
        String providerName,
        String providerCompany,
        String providerAddress,
        String clientName,
        String clientAddress,
        String clientContactName,
        String clientContactEmail
) {}
