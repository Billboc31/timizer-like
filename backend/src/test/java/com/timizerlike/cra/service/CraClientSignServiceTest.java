package com.timizerlike.cra.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.timizer.backend.cra.CraAlreadyClientSignedException;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraNotValidatedException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDetailsDto;

class CraClientSignServiceTest {

    private static final Long CRA_ID = 1L;
    private static final LocalDate SIGN_DATE = LocalDate.of(2026, 7, 1);

    private MonthlyCraReportRepository craRepository;
    private CraClientSignService service;

    @BeforeEach
    void setUp() {
        craRepository = mock(MonthlyCraReportRepository.class);
        service = new CraClientSignService(craRepository);
    }

    @Test
    void throwsCraNotFoundWhenCraAbsent() {
        when(craRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.clientSign(99L, "Bob", SIGN_DATE, null))
                .isInstanceOf(CraNotFoundException.class);

        verify(craRepository, never()).save(any());
    }

    @Test
    void throwsCraNotValidatedWhenCraIsDraft() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.DRAFT);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.clientSign(CRA_ID, "Bob", SIGN_DATE, null))
                .isInstanceOf(CraNotValidatedException.class);

        verify(craRepository, never()).save(any());
    }

    @Test
    void throwsAlreadyClientSignedWhenAlreadySigned() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.VALIDATED);
        when(cra.getClientSignatureDate()).thenReturn(LocalDate.of(2026, 6, 20));
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.clientSign(CRA_ID, "Bob", SIGN_DATE, null))
                .isInstanceOf(CraAlreadyClientSignedException.class);

        verify(craRepository, never()).save(any());
    }

    @Test
    void storesClientFieldsOnHappyPath() {
        MonthlyCraReport cra = validatedUnsignedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        CraDetailsDto result = service.clientSign(CRA_ID, "Bob Representative", SIGN_DATE, null);

        verify(craRepository).save(cra);
        verify(cra).setClientRepresentativeName("Bob Representative");
        verify(cra).setClientSignatureDate(SIGN_DATE);
        assertThat(result).isNotNull();
    }

    @Test
    void storesSignatureImageWhenProvided() {
        MonthlyCraReport cra = validatedUnsignedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        service.clientSign(CRA_ID, "Bob", SIGN_DATE, "base64image==");

        verify(cra).setClientSignatureImage("base64image==");
    }

    @Test
    void doesNotStoreSignatureImageWhenBlank() {
        MonthlyCraReport cra = validatedUnsignedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        service.clientSign(CRA_ID, "Bob", SIGN_DATE, "   ");

        verify(cra, never()).setClientSignatureImage(any());
    }

    private MonthlyCraReport validatedUnsignedCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getId()).thenReturn(CRA_ID);
        when(cra.getMonth()).thenReturn(6);
        when(cra.getYear()).thenReturn(2026);
        when(cra.getStatus()).thenReturn(ValidationStatus.VALIDATED);
        when(cra.getClientSignatureDate()).thenReturn(null);
        when(cra.getDayEntries()).thenReturn(new java.util.ArrayList<>());
        return cra;
    }
}
