package com.timizerlike.backend.cra.dto;

import java.time.LocalDate;
import java.util.List;

public record CraPublicViewDto(
        Long craId,
        String status,
        int month,
        int year,
        String providerFirstName,
        String providerLastName,
        String providerCompany,
        String clientFirstName,
        String clientLastName,
        String clientCompany,
        String clientContactEmail,
        LocalDate providerSignatureDate,
        double totalWorkedDays,
        List<CraDayEntryDto> dayEntries
) {
}
