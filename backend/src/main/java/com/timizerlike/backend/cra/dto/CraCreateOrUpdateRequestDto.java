package com.timizerlike.backend.cra.dto;

import java.util.List;

public record CraCreateOrUpdateRequestDto(
        int month,
        int year,
        List<CraDayEntryDto> days
) {
}
