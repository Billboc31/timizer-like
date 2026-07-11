package com.timizerlike.backend.cra.dto;

import java.util.List;

public record CraDetailsDto(
        Long id,
        int month,
        int year,
        double totalWorkedDays,
        CraStatus status,
        List<CraDayEntryDto> days
) {
}
