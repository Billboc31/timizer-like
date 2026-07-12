package com.timizerlike.cra.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.timizer.backend.cra.CraTotalCalculationService;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraStatus;
import com.timizerlike.backend.cra.dto.CraSummaryDto;

class CraHistoryServiceTest {

    private MonthlyCraReportRepository craRepository;
    private CraTotalCalculationService calculationService;
    private CraHistoryService service;

    @BeforeEach
    void setUp() {
        craRepository = mock(MonthlyCraReportRepository.class);
        calculationService = mock(CraTotalCalculationService.class);
        service = new CraHistoryService(craRepository, calculationService);
    }

    @Test
    void returnsEmptyListWhenNoReports() {
        when(craRepository.findAllByOrderByYearDescMonthDesc()).thenReturn(List.of());

        List<CraSummaryDto> result = service.listHistory();

        assertThat(result).isEmpty();
    }

    @Test
    void mapsDraftReportToSummary() {
        MonthlyCraReport cra = mockReport(1L, 6, 2026, ValidationStatus.DRAFT, null, List.of());
        when(craRepository.findAllByOrderByYearDescMonthDesc()).thenReturn(List.of(cra));
        when(calculationService.calculateTotalWorkedDays(List.of())).thenReturn(0.0);

        List<CraSummaryDto> result = service.listHistory();

        assertThat(result).hasSize(1);
        CraSummaryDto summary = result.get(0);
        assertThat(summary.id()).isEqualTo(1L);
        assertThat(summary.month()).isEqualTo(6);
        assertThat(summary.year()).isEqualTo(2026);
        assertThat(summary.status()).isEqualTo(CraStatus.DRAFT);
        assertThat(summary.validationDate()).isNull();
        assertThat(summary.totalWorkedDays()).isEqualTo(0.0);
    }

    @Test
    void mapsValidatedReportWithValidationDate() {
        LocalDate validationDate = LocalDate.of(2026, 6, 30);
        MonthlyCraReport cra = mockReport(2L, 6, 2026, ValidationStatus.VALIDATED, validationDate, List.of());
        when(craRepository.findAllByOrderByYearDescMonthDesc()).thenReturn(List.of(cra));
        when(calculationService.calculateTotalWorkedDays(List.of())).thenReturn(20.0);

        List<CraSummaryDto> result = service.listHistory();

        CraSummaryDto summary = result.get(0);
        assertThat(summary.status()).isEqualTo(CraStatus.VALIDATED);
        assertThat(summary.validationDate()).isEqualTo(validationDate);
        assertThat(summary.totalWorkedDays()).isEqualTo(20.0);
    }

    @Test
    void mapsSignedByProviderAsDraft() {
        MonthlyCraReport cra = mockReport(3L, 5, 2026, ValidationStatus.SIGNED_BY_PROVIDER, null, List.of());
        when(craRepository.findAllByOrderByYearDescMonthDesc()).thenReturn(List.of(cra));
        when(calculationService.calculateTotalWorkedDays(List.of())).thenReturn(10.0);

        List<CraSummaryDto> result = service.listHistory();

        assertThat(result.get(0).status()).isEqualTo(CraStatus.DRAFT);
    }

    @Test
    void returnsMultipleReportsInRepositoryOrder() {
        MonthlyCraReport cra1 = mockReport(1L, 6, 2026, ValidationStatus.VALIDATED, null, List.of());
        MonthlyCraReport cra2 = mockReport(2L, 5, 2026, ValidationStatus.DRAFT, null, List.of());
        when(craRepository.findAllByOrderByYearDescMonthDesc()).thenReturn(List.of(cra1, cra2));
        when(calculationService.calculateTotalWorkedDays(List.of())).thenReturn(0.0);

        List<CraSummaryDto> result = service.listHistory();

        assertThat(result).hasSize(2);
        assertThat(result.get(0).id()).isEqualTo(1L);
        assertThat(result.get(1).id()).isEqualTo(2L);
    }

    private MonthlyCraReport mockReport(Long id, int month, int year, ValidationStatus status,
            LocalDate validationDate, List<com.timizer.backend.cra.CraDayEntry> entries) {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getId()).thenReturn(id);
        when(cra.getMonth()).thenReturn(month);
        when(cra.getYear()).thenReturn(year);
        when(cra.getStatus()).thenReturn(status);
        when(cra.getValidationDate()).thenReturn(validationDate);
        when(cra.getDayEntries()).thenReturn(entries);
        return cra;
    }
}
