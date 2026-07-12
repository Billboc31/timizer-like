package com.timizerlike.cra.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.timizer.backend.cra.CraDayEntry;
import com.timizer.backend.cra.CraDayEntryRepository;
import com.timizer.backend.cra.CraDayNotFoundException;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraValidatedException;
import com.timizer.backend.cra.InvalidWorkValueException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDayUpdateRequestDto;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;

class CraDayUpdateServiceTest {

    private static final Long CRA_ID = 1L;
    private static final LocalDate JUNE_15 = LocalDate.of(2026, 6, 15);

    private MonthlyCraReportRepository craRepository;
    private CraDayEntryRepository dayEntryRepository;
    private CraDayUpdateService service;

    @BeforeEach
    void setUp() {
        craRepository = mock(MonthlyCraReportRepository.class);
        dayEntryRepository = mock(CraDayEntryRepository.class);
        service = new CraDayUpdateService(craRepository, dayEntryRepository);
    }

    private MonthlyCraReport draftCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getId()).thenReturn(CRA_ID);
        when(cra.getMonth()).thenReturn(6);
        when(cra.getYear()).thenReturn(2026);
        when(cra.getStatus()).thenReturn(ValidationStatus.DRAFT);
        return cra;
    }

    private CraDayEntry entryFor(LocalDate date, double workValue, String note) {
        CraDayEntry entry = new CraDayEntry(CRA_ID, date, workValue, note);
        return entry;
    }

    @Test
    void updatesWorkValueOnly() {
        MonthlyCraReport cra = draftCra();
        CraDayEntry entry = entryFor(JUNE_15, 1.0, "existing note");
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(dayEntryRepository.findByMonthlyCraReport_IdAndDate(CRA_ID, JUNE_15)).thenReturn(Optional.of(entry));
        when(dayEntryRepository.findByMonthlyCraReport_IdOrderByDateAsc(CRA_ID)).thenReturn(List.of(entry));
        when(dayEntryRepository.save(entry)).thenReturn(entry);

        CraDetailsDto result = service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.5, null));

        assertThat(entry.getWorkValue()).isEqualTo(0.5);
        assertThat(entry.getNote()).isEqualTo("existing note");
        assertThat(result.days()).hasSize(1);
        assertThat(result.days().get(0).worked()).isEqualTo(0.5);
        assertThat(result.days().get(0).note()).isEqualTo("existing note");
        verify(dayEntryRepository, times(1)).save(entry);
    }

    @Test
    void updatesNoteOnly() {
        MonthlyCraReport cra = draftCra();
        CraDayEntry entry = entryFor(JUNE_15, 1.0, "old note");
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(dayEntryRepository.findByMonthlyCraReport_IdAndDate(CRA_ID, JUNE_15)).thenReturn(Optional.of(entry));
        when(dayEntryRepository.findByMonthlyCraReport_IdOrderByDateAsc(CRA_ID)).thenReturn(List.of(entry));
        when(dayEntryRepository.save(entry)).thenReturn(entry);

        CraDetailsDto result = service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(null, "new note"));

        assertThat(entry.getWorkValue()).isEqualTo(1.0);
        assertThat(entry.getNote()).isEqualTo("new note");
        assertThat(result.days().get(0).note()).isEqualTo("new note");
        verify(dayEntryRepository, times(1)).save(entry);
    }

    @Test
    void updatesBothWorkValueAndNote() {
        MonthlyCraReport cra = draftCra();
        CraDayEntry entry = entryFor(JUNE_15, 1.0, "old");
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(dayEntryRepository.findByMonthlyCraReport_IdAndDate(CRA_ID, JUNE_15)).thenReturn(Optional.of(entry));
        when(dayEntryRepository.findByMonthlyCraReport_IdOrderByDateAsc(CRA_ID)).thenReturn(List.of(entry));
        when(dayEntryRepository.save(entry)).thenReturn(entry);

        service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.5, "updated"));

        assertThat(entry.getWorkValue()).isEqualTo(0.5);
        assertThat(entry.getNote()).isEqualTo("updated");
    }

    @Test
    void emptyNoteClears() {
        MonthlyCraReport cra = draftCra();
        CraDayEntry entry = entryFor(JUNE_15, 1.0, "some note");
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(dayEntryRepository.findByMonthlyCraReport_IdAndDate(CRA_ID, JUNE_15)).thenReturn(Optional.of(entry));
        when(dayEntryRepository.findByMonthlyCraReport_IdOrderByDateAsc(CRA_ID)).thenReturn(List.of(entry));
        when(dayEntryRepository.save(entry)).thenReturn(entry);

        service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(null, ""));

        assertThat(entry.getNote()).isNull();
    }

    @Test
    void nullNoteLeavesPriorNoteUnchanged() {
        MonthlyCraReport cra = draftCra();
        CraDayEntry entry = entryFor(JUNE_15, 1.0, "preserved");
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(dayEntryRepository.findByMonthlyCraReport_IdAndDate(CRA_ID, JUNE_15)).thenReturn(Optional.of(entry));
        when(dayEntryRepository.findByMonthlyCraReport_IdOrderByDateAsc(CRA_ID)).thenReturn(List.of(entry));
        when(dayEntryRepository.save(entry)).thenReturn(entry);

        service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(null, null));

        assertThat(entry.getNote()).isEqualTo("preserved");
    }

    @Test
    void rejectsInvalidWorkValue() {
        MonthlyCraReport cra = draftCra();
        CraDayEntry entry = entryFor(JUNE_15, 1.0, null);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(dayEntryRepository.findByMonthlyCraReport_IdAndDate(CRA_ID, JUNE_15)).thenReturn(Optional.of(entry));

        assertThatThrownBy(() -> service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.25, null)))
                .isInstanceOf(InvalidWorkValueException.class);
        verify(dayEntryRepository, never()).save(any());
    }

    @Test
    void rejectsUpdateOnValidatedCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.VALIDATED);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.5, null)))
                .isInstanceOf(CraValidatedException.class);
        verify(dayEntryRepository, never()).findByMonthlyCraReport_IdAndDate(any(), any());
    }

    @Test
    void rejectsUpdateOnSignedByProviderCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.SIGNED_BY_PROVIDER);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.5, null)))
                .isInstanceOf(CraValidatedException.class);
    }

    @Test
    void throwsCraNotFoundWhenCraAbsent() {
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.5, null)))
                .isInstanceOf(CraNotFoundException.class);
    }

    @Test
    void throwsCraDayNotFoundWhenDayAbsent() {
        MonthlyCraReport cra = draftCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(dayEntryRepository.findByMonthlyCraReport_IdAndDate(CRA_ID, JUNE_15)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.5, null)))
                .isInstanceOf(CraDayNotFoundException.class);
    }

    @Test
    void persistsViaRepositoryExactlyOnce() {
        MonthlyCraReport cra = draftCra();
        CraDayEntry entry = entryFor(JUNE_15, 1.0, null);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(dayEntryRepository.findByMonthlyCraReport_IdAndDate(CRA_ID, JUNE_15)).thenReturn(Optional.of(entry));
        when(dayEntryRepository.findByMonthlyCraReport_IdOrderByDateAsc(CRA_ID)).thenReturn(List.of(entry));
        when(dayEntryRepository.save(entry)).thenReturn(entry);

        service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(0.5, null));

        verify(dayEntryRepository, times(1)).save(entry);
    }

    @Test
    void responseDtoIncludesCraMetadata() {
        MonthlyCraReport cra = draftCra();
        CraDayEntry entry = entryFor(JUNE_15, 0.5, null);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(dayEntryRepository.findByMonthlyCraReport_IdAndDate(CRA_ID, JUNE_15)).thenReturn(Optional.of(entry));
        when(dayEntryRepository.findByMonthlyCraReport_IdOrderByDateAsc(CRA_ID)).thenReturn(List.of(entry));
        when(dayEntryRepository.save(entry)).thenReturn(entry);

        CraDetailsDto result = service.updateDay(CRA_ID, JUNE_15, new CraDayUpdateRequestDto(null, null));

        assertThat(result.id()).isEqualTo(CRA_ID);
        assertThat(result.month()).isEqualTo(6);
        assertThat(result.year()).isEqualTo(2026);
        assertThat(result.status()).isEqualTo(CraStatus.DRAFT);
        assertThat(result.totalWorkedDays()).isEqualTo(0.5);
    }
}
