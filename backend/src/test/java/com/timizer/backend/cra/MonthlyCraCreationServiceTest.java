package com.timizer.backend.cra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.timizer.backend.cra.MonthlyCraCreationService.CraCreationResult;
import com.timizerlike.backend.cra.dto.CraDayEntryDto;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;
import com.timizerlike.cra.config.CraDefaultsProperties;

class MonthlyCraCreationServiceTest {

    private static final CraDefaultsProperties DEFAULTS = new CraDefaultsProperties(
            new CraDefaultsProperties.Provider("Alice Provider", "Provider Co.", "1 rue Test"),
            new CraDefaultsProperties.Client(
                    "Lyra Network",
                    "Client Address",
                    new CraDefaultsProperties.Client.Contact("Bob Client", "bob@example.com")
            )
    );

    @Test
    void createsCraForFebruary2025With28Entries() {
        MonthlyCraReportRepository repository = mock(MonthlyCraReportRepository.class);
        when(repository.findByMonthAndYear(2, 2025)).thenReturn(Optional.empty());
        when(repository.save(any(MonthlyCraReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MonthlyCraCreationService service = new MonthlyCraCreationService(repository, DEFAULTS);

        CraCreationResult result = service.createForMonth(2025, 2);

        assertThat(result.created()).isTrue();
        CraDetailsDto dto = result.cra();
        assertThat(dto.month()).isEqualTo(2);
        assertThat(dto.year()).isEqualTo(2025);
        assertThat(dto.status()).isEqualTo(CraStatus.DRAFT);
        assertThat(dto.days()).hasSize(28);
        assertDefaultsApplied(2025, 2, dto.days());
        verify(repository, times(1)).save(any(MonthlyCraReport.class));
    }

    @Test
    void createsCraForJanuary2025With31Entries() {
        MonthlyCraReportRepository repository = mock(MonthlyCraReportRepository.class);
        when(repository.findByMonthAndYear(1, 2025)).thenReturn(Optional.empty());
        when(repository.save(any(MonthlyCraReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MonthlyCraCreationService service = new MonthlyCraCreationService(repository, DEFAULTS);

        CraCreationResult result = service.createForMonth(2025, 1);

        assertThat(result.created()).isTrue();
        assertThat(result.cra().days()).hasSize(31);
        assertDefaultsApplied(2025, 1, result.cra().days());
    }

    @Test
    void createsCraForLeapFebruary2024With29Entries() {
        MonthlyCraReportRepository repository = mock(MonthlyCraReportRepository.class);
        when(repository.findByMonthAndYear(2, 2024)).thenReturn(Optional.empty());
        when(repository.save(any(MonthlyCraReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MonthlyCraCreationService service = new MonthlyCraCreationService(repository, DEFAULTS);

        CraCreationResult result = service.createForMonth(2024, 2);

        assertThat(result.created()).isTrue();
        assertThat(result.cra().days()).hasSize(29);
    }

    @Test
    void duplicateCallReturnsExistingCraWithoutSaving() {
        MonthlyCraReportRepository repository = mock(MonthlyCraReportRepository.class);

        MonthlyCraReport existing = buildExisting(2025, 3);
        when(repository.findByMonthAndYear(3, 2025)).thenReturn(Optional.of(existing));

        MonthlyCraCreationService service = new MonthlyCraCreationService(repository, DEFAULTS);

        CraCreationResult result = service.createForMonth(2025, 3);

        assertThat(result.created()).isFalse();
        assertThat(result.cra().month()).isEqualTo(3);
        assertThat(result.cra().year()).isEqualTo(2025);
        verify(repository, never()).save(any(MonthlyCraReport.class));
    }

    @Test
    void totalWorkedDaysMatchesSumOfDayValues() {
        MonthlyCraReportRepository repository = mock(MonthlyCraReportRepository.class);
        when(repository.findByMonthAndYear(3, 2025)).thenReturn(Optional.empty());
        when(repository.save(any(MonthlyCraReport.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MonthlyCraCreationService service = new MonthlyCraCreationService(repository, DEFAULTS);

        CraCreationResult result = service.createForMonth(2025, 3);

        double expected = result.cra().days().stream().mapToDouble(CraDayEntryDto::worked).sum();
        assertThat(result.cra().totalWorkedDays()).isEqualTo(expected);
    }

    private static void assertDefaultsApplied(int year, int month, List<CraDayEntryDto> days) {
        YearMonth ym = YearMonth.of(year, month);
        assertThat(days).hasSize(ym.lengthOfMonth());
        for (CraDayEntryDto day : days) {
            LocalDate date = ym.atDay(day.day());
            boolean weekend = date.getDayOfWeek() == DayOfWeek.SATURDAY || date.getDayOfWeek() == DayOfWeek.SUNDAY;
            double expected = weekend ? 0.0 : 1.0;
            assertThat(day.worked())
                    .as("day %s", date)
                    .isEqualTo(expected);
        }
    }

    private static MonthlyCraReport buildExisting(int year, int month) {
        MonthlyCraReport report = new MonthlyCraReport(
                month,
                year,
                "Alice",
                "Provider",
                "Provider Co.",
                "Bob",
                "Client",
                "Lyra Network",
                "bob@example.com",
                null
        );
        YearMonth ym = YearMonth.of(year, month);
        for (int day = 1; day <= ym.lengthOfMonth(); day++) {
            report.addDayEntry(new CraDayEntry(ym.atDay(day), 0.0, null));
        }
        return report;
    }
}
