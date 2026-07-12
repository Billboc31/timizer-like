package com.timizerlike.backend.cra.dto;

import java.time.LocalDate;
import java.util.List;

public record CraDetailsDto(
        Long id,
        int month,
        int year,
        double totalWorkedDays,
        CraStatus status,
        List<CraDayEntryDto> days,
        LocalDate validationDate,
        LocalDate providerSignatureDate,
        String providerFirstName,
        String providerLastName,
        String providerCompany,
        String clientFirstName,
        String clientLastName,
        String clientCompany
) {
}
