package com.timizer.backend.cra;

import java.util.ArrayList;
import java.util.List;

import com.timizerlike.backend.cra.dto.CraDayEntryDto;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;

public final class CraDetailsMapper {

    private CraDetailsMapper() {
    }

    public static CraDetailsDto toDto(MonthlyCraReport report) {
        List<CraDayEntry> entries = report.getDayEntries();
        List<CraDayEntryDto> dayDtos = new ArrayList<>(entries.size());
        double total = 0.0;
        for (CraDayEntry entry : entries) {
            dayDtos.add(new CraDayEntryDto(entry.getDate().getDayOfMonth(), entry.getWorkValue(), entry.getNote()));
            total += entry.getWorkValue();
        }
        return new CraDetailsDto(
                report.getId(),
                report.getMonth(),
                report.getYear(),
                total,
                mapStatus(report.getStatus()),
                dayDtos,
                report.getValidationDate(),
                report.getProviderSignatureDate(),
                report.getProviderFirstName(),
                report.getProviderLastName(),
                report.getProviderCompany(),
                report.getClientFirstName(),
                report.getClientLastName(),
                report.getClientCompany(),
                report.getClientAddress(),
                report.getClientContactRole(),
                report.getProviderSignatureImage(),
                report.getProviderSignerName()
        );
    }

    public static CraStatus mapStatus(ValidationStatus status) {
        return switch (status) {
            case DRAFT -> CraStatus.DRAFT;
            case READY_FOR_PROVIDER_SIGNATURE -> CraStatus.READY_FOR_PROVIDER_SIGNATURE;
            case SIGNED_BY_PROVIDER -> CraStatus.SIGNED_BY_PROVIDER;
            case AWAITING_CLIENT_SIGNATURE -> CraStatus.AWAITING_CLIENT_SIGNATURE;
            case FULLY_SIGNED -> CraStatus.FULLY_SIGNED;
            case VALIDATED -> CraStatus.VALIDATED;
        };
    }
}
