package com.timizerlike.cra.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraValidatedException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDetailsDto;

class CraValidationServiceTest {

    private static final Long CRA_ID = 1L;
    private static final LocalDate JUNE_30 = LocalDate.of(2026, 6, 30);

    private MonthlyCraReportRepository craRepository;
    private CraValidationService service;

    @BeforeEach
    void setUp() {
        craRepository = mock(MonthlyCraReportRepository.class);
        service = new CraValidationService(craRepository);
    }

    @Test
    void validatesDraftCraAndSetsAllThreeFields() {
        MonthlyCraReport cra = draftCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        service.validate(CRA_ID, JUNE_30);

        verify(cra).setStatus(ValidationStatus.VALIDATED);
        verify(cra).setProviderSignatureDate(JUNE_30);
        verify(cra).setValidationDate(any(LocalDate.class));
        verify(craRepository).save(cra);
    }

    @Test
    void throwsCraNotFoundWhenCraAbsent() {
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.validate(CRA_ID, JUNE_30))
                .isInstanceOf(CraNotFoundException.class);
    }

    @Test
    void throwsCraValidatedWhenNotInDraftStatus() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.VALIDATED);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.validate(CRA_ID, JUNE_30))
                .isInstanceOf(CraValidatedException.class);
        verify(craRepository, never()).save(any());
    }

    @Test
    void returnsDtoWithCraMetadata() {
        MonthlyCraReport cra = draftCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        CraDetailsDto result = service.validate(CRA_ID, JUNE_30);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(CRA_ID);
        assertThat(result.month()).isEqualTo(6);
        assertThat(result.year()).isEqualTo(2026);
    }

    private MonthlyCraReport draftCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getId()).thenReturn(CRA_ID);
        when(cra.getMonth()).thenReturn(6);
        when(cra.getYear()).thenReturn(2026);
        when(cra.getStatus()).thenReturn(ValidationStatus.DRAFT);
        when(cra.getDayEntries()).thenReturn(List.of());
        return cra;
    }
}
