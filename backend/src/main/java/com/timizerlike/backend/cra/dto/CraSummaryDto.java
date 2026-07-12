package com.timizerlike.backend.cra.dto;

import java.time.LocalDate;

public record CraSummaryDto(
        Long id,
        int month,
        int year,
        double totalWorkedDays,
        CraStatus status,
        LocalDate validationDate
) {
}
