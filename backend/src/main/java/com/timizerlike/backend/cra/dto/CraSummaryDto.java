package com.timizerlike.backend.cra.dto;

public record CraSummaryDto(
        Long id,
        int month,
        int year,
        double totalWorkedDays,
        CraStatus status
) {
}
