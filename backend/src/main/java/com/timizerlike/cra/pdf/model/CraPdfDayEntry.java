package com.timizerlike.cra.pdf.model;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;

public record CraPdfDayEntry(
        LocalDate date,
        DayOfWeek dayOfWeek,
        CraPdfDayType type,
        BigDecimal workedFraction,
        String comment
) {}
