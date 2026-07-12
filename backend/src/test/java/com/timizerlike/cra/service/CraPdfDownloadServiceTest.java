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
import com.timizer.backend.cra.CraNotValidatedException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.cra.pdf.CraPdfGenerator;
import com.timizerlike.cra.pdf.model.CraPdfDocument;

class CraPdfDownloadServiceTest {

    private static final Long CRA_ID = 1L;

    private MonthlyCraReportRepository craRepository;
    private CraPdfGenerator pdfGenerator;
    private CraPdfDownloadService service;

    @BeforeEach
    void setUp() {
        craRepository = mock(MonthlyCraReportRepository.class);
        pdfGenerator = mock(CraPdfGenerator.class);
        service = new CraPdfDownloadService(craRepository, pdfGenerator);
    }

    @Test
    void throwsCraNotFoundWhenCraAbsent() {
        when(craRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.download(99L))
                .isInstanceOf(CraNotFoundException.class);

        verify(pdfGenerator, never()).generate(any());
    }

    @Test
    void throwsCraNotValidatedWhenCraIsNotValidated() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.DRAFT);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.download(CRA_ID))
                .isInstanceOf(CraNotValidatedException.class);

        verify(pdfGenerator, never()).generate(any());
    }

    @Test
    void returnsPdfBytesForValidatedCra() {
        MonthlyCraReport cra = validatedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        byte[] pdfBytes = new byte[]{1, 2, 3};
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(pdfBytes);

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result.content()).isEqualTo(pdfBytes);
    }

    @Test
    void filenameContainsPeriod() {
        MonthlyCraReport cra = validatedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result.filename()).contains("2026-06");
    }

    @Test
    void filenameContainsProviderAndClientCompany() {
        MonthlyCraReport cra = validatedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result.filename()).contains("Acme").contains("ClientCo");
    }

    @Test
    void filenameEndsWithPdfExtension() {
        MonthlyCraReport cra = validatedCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(pdfGenerator.generate(any(CraPdfDocument.class))).thenReturn(new byte[]{});

        CraPdfDownloadResult result = service.download(CRA_ID);

        assertThat(result.filename()).endsWith(".pdf");
    }

    private MonthlyCraReport validatedCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getId()).thenReturn(CRA_ID);
        when(cra.getMonth()).thenReturn(6);
        when(cra.getYear()).thenReturn(2026);
        when(cra.getStatus()).thenReturn(ValidationStatus.VALIDATED);
        when(cra.getProviderFirstName()).thenReturn("John");
        when(cra.getProviderLastName()).thenReturn("Doe");
        when(cra.getProviderCompany()).thenReturn("Acme");
        when(cra.getClientFirstName()).thenReturn("Jane");
        when(cra.getClientLastName()).thenReturn("Smith");
        when(cra.getClientCompany()).thenReturn("ClientCo");
        when(cra.getClientContactEmail()).thenReturn("jane@clientco.com");
        when(cra.getProviderSignatureDate()).thenReturn(LocalDate.of(2026, 6, 30));
        when(cra.getDayEntries()).thenReturn(List.of());
        return cra;
    }
}
