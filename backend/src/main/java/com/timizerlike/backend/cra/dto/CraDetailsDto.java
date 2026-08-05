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
        String providerRaisonSociale,
        String providerSiret,
        String providerAdresse,
        String providerCodePostal,
        String providerVille,
        String providerPays,
        String clientFirstName,
        String clientLastName,
        String clientCompany,
        String clientAddress,
        String clientContactRole,
        String providerSignatureImage,
        String providerSignerName,
        LocalDate clientSignatureDate,
        String clientRepresentativeName
) {
}
