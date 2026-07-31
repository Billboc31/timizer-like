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

import com.fasterxml.jackson.databind.ObjectMapper;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraValidationBlockedException;
import com.timizer.backend.cra.CraValidationBlockingReason;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDetailsDto;

class CraValidationServiceTest {

    private static final Long CRA_ID = 1L;
    private static final LocalDate JUNE_30 = LocalDate.of(2026, 6, 30);
    private static final String SIGNER_NAME = "Jean Dupont";
    private static final String SIGNATURE_IMAGE = "data:image/png;base64,abc123";

    private MonthlyCraReportRepository craRepository;
    private CraValidationService service;

    @BeforeEach
    void setUp() {
        craRepository = mock(MonthlyCraReportRepository.class);
        service = new CraValidationService(craRepository, new ObjectMapper());
    }

    @Test
    void validatesDraftCraAndSetsAllFields() {
        MonthlyCraReport cra = draftCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        service.validate(CRA_ID, JUNE_30, SIGNATURE_IMAGE, SIGNER_NAME);

        verify(cra).setStatus(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
        verify(cra).setProviderSignatureDate(JUNE_30);
        verify(cra).setProviderSignatureImage(SIGNATURE_IMAGE);
        verify(cra).setProviderSignerName(SIGNER_NAME);
        verify(cra).setValidationDate(any(LocalDate.class));
        verify(cra).setProviderContentHash(any(String.class));
        verify(craRepository).save(cra);
    }

    @Test
    void throwsCraNotFoundWhenCraAbsent() {
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.validate(CRA_ID, JUNE_30, SIGNATURE_IMAGE, SIGNER_NAME))
                .isInstanceOf(CraNotFoundException.class);
    }

    @Test
    void throwsValidationBlockedWithStatusNotDraftWhenNotInDraftStatus() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.VALIDATED);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.validate(CRA_ID, JUNE_30, SIGNATURE_IMAGE, SIGNER_NAME))
                .isInstanceOf(CraValidationBlockedException.class)
                .satisfies(e -> {
                    List<CraValidationBlockingReason> reasons =
                            ((CraValidationBlockedException) e).getReasons();
                    assertThat(reasons).contains(CraValidationBlockingReason.STATUS_NOT_DRAFT);
                });
        verify(craRepository, never()).save(any());
    }

    @Test
    void throwsValidationBlockedWithInvalidSignatureImageWhenImageMissing() {
        MonthlyCraReport cra = draftCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.validate(CRA_ID, JUNE_30, null, SIGNER_NAME))
                .isInstanceOf(CraValidationBlockedException.class)
                .satisfies(e -> {
                    List<CraValidationBlockingReason> reasons =
                            ((CraValidationBlockedException) e).getReasons();
                    assertThat(reasons).contains(CraValidationBlockingReason.INVALID_SIGNATURE_IMAGE);
                });
        verify(craRepository, never()).save(any());
    }

    @Test
    void throwsValidationBlockedWithInvalidSignatureImageWhenImageNotDataUri() {
        MonthlyCraReport cra = draftCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.validate(CRA_ID, JUNE_30, "not-a-data-uri", SIGNER_NAME))
                .isInstanceOf(CraValidationBlockedException.class)
                .satisfies(e -> {
                    List<CraValidationBlockingReason> reasons =
                            ((CraValidationBlockedException) e).getReasons();
                    assertThat(reasons).contains(CraValidationBlockingReason.INVALID_SIGNATURE_IMAGE);
                });
        verify(craRepository, never()).save(any());
    }

    @Test
    void collectsBothBlockingReasonsWhenStatusNotDraftAndImageInvalid() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.validate(CRA_ID, JUNE_30, null, SIGNER_NAME))
                .isInstanceOf(CraValidationBlockedException.class)
                .satisfies(e -> {
                    List<CraValidationBlockingReason> reasons =
                            ((CraValidationBlockedException) e).getReasons();
                    assertThat(reasons).containsExactlyInAnyOrder(
                            CraValidationBlockingReason.STATUS_NOT_DRAFT,
                            CraValidationBlockingReason.INVALID_SIGNATURE_IMAGE);
                });
    }

    @Test
    void returnsDtoWithCraMetadata() {
        MonthlyCraReport cra = draftCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        CraDetailsDto result = service.validate(CRA_ID, JUNE_30, SIGNATURE_IMAGE, SIGNER_NAME);

        assertThat(result).isNotNull();
        assertThat(result.id()).isEqualTo(CRA_ID);
        assertThat(result.month()).isEqualTo(6);
        assertThat(result.year()).isEqualTo(2026);
    }

    @Test
    void signatureSnapshotIsStoredOnCraIndependentlyOfSettings() {
        MonthlyCraReport cra = draftCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        service.validate(CRA_ID, JUNE_30, SIGNATURE_IMAGE, SIGNER_NAME);

        // The snapshot is committed to the CRA entity; a later change to settings
        // cannot retroactively affect this record.
        verify(cra).setProviderSignatureImage(SIGNATURE_IMAGE);
        verify(cra).setProviderSignerName(SIGNER_NAME);
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
