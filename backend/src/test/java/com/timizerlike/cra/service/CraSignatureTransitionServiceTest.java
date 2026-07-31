package com.timizerlike.cra.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doAnswer;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicReference;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.EnumSource.Mode;
import org.mockito.ArgumentCaptor;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.DuplicateCraTransitionException;
import com.timizer.backend.cra.InvalidCraTransitionException;
import com.timizer.backend.cra.InvalidSignatureImageException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;

class CraSignatureTransitionServiceTest {

    private static final Long CRA_ID = 1L;
    private static final LocalDate JULY_31 = LocalDate.of(2026, 7, 31);
    private static final String VALID_IMAGE = "data:image/png;base64,abc123";

    private MonthlyCraReportRepository craRepository;
    private CraSignatureTransitionService service;

    @BeforeEach
    void setUp() {
        craRepository = mock(MonthlyCraReportRepository.class);
        service = new CraSignatureTransitionService(craRepository);
    }

    // --- submit ---

    @Test
    void submitTransitionsDraftToReadyForProviderSignature() {
        MonthlyCraReport cra = craWithStatus(ValidationStatus.DRAFT);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        CraDetailsDto result = service.submit(CRA_ID);

        verify(cra).setStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
        verify(craRepository).save(cra);
        assertThat(result.status()).isEqualTo(CraStatus.READY_FOR_PROVIDER_SIGNATURE);
    }

    @Test
    void submitThrowsDuplicateWhenAlreadyReadyForProviderSignature() {
        MonthlyCraReport cra = craWithStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.submit(CRA_ID))
                .isInstanceOf(DuplicateCraTransitionException.class);
        verify(craRepository, never()).save(any());
    }

    @ParameterizedTest
    @EnumSource(value = ValidationStatus.class, names = {"DRAFT", "READY_FOR_PROVIDER_SIGNATURE"}, mode = Mode.EXCLUDE)
    void submitThrowsInvalidTransitionForNonDraftStatus(ValidationStatus status) {
        MonthlyCraReport cra = craWithStatus(status);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.submit(CRA_ID))
                .isInstanceOf(InvalidCraTransitionException.class);
        verify(craRepository, never()).save(any());
    }

    @Test
    void submitThrowsCraNotFoundWhenAbsent() {
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.submit(CRA_ID))
                .isInstanceOf(CraNotFoundException.class);
    }

    // --- signByProvider ---

    @Test
    void signByProviderTransitionsToSignedByProvider() {
        MonthlyCraReport cra = craWithStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        CraDetailsDto result = service.signByProvider(CRA_ID, JULY_31, VALID_IMAGE);

        verify(cra).setStatus(ValidationStatus.SIGNED_BY_PROVIDER);
        verify(cra).setProviderSignatureDate(JULY_31);
        verify(craRepository).save(cra);
        assertThat(result.status()).isEqualTo(CraStatus.SIGNED_BY_PROVIDER);
    }

    @Test
    void signByProviderSetsProviderSignatureDate() {
        MonthlyCraReport cra = craWithStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        service.signByProvider(CRA_ID, JULY_31, VALID_IMAGE);

        verify(cra).setProviderSignatureDate(JULY_31);
    }

    // F3: signByProvider stores providerSignatureImage and providerSignedAt
    @Test
    void signByProviderStoresSignatureImageAndSignedAt() {
        MonthlyCraReport cra = craWithStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);
        Instant before = Instant.now();

        service.signByProvider(CRA_ID, JULY_31, VALID_IMAGE);

        verify(cra).setProviderSignatureImage(VALID_IMAGE);
        ArgumentCaptor<Instant> captor = ArgumentCaptor.forClass(Instant.class);
        verify(cra).setProviderSignedAt(captor.capture());
        assertThat(captor.getValue()).isAfterOrEqualTo(before);
    }

    @Test
    void signByProviderThrowsInvalidSignatureImageWhenImageIsBlank() {
        assertThatThrownBy(() -> service.signByProvider(CRA_ID, JULY_31, ""))
                .isInstanceOf(InvalidSignatureImageException.class);
        verify(craRepository, never()).save(any());
    }

    @Test
    void signByProviderThrowsInvalidSignatureImageWhenImageHasWrongPrefix() {
        assertThatThrownBy(() -> service.signByProvider(CRA_ID, JULY_31, "base64,abc"))
                .isInstanceOf(InvalidSignatureImageException.class);
        verify(craRepository, never()).save(any());
    }

    @Test
    void signByProviderThrowsDuplicateWhenAlreadySignedByProvider() {
        MonthlyCraReport cra = craWithStatus(ValidationStatus.SIGNED_BY_PROVIDER);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.signByProvider(CRA_ID, JULY_31, VALID_IMAGE))
                .isInstanceOf(DuplicateCraTransitionException.class);
        verify(craRepository, never()).save(any());
    }

    @ParameterizedTest
    @EnumSource(value = ValidationStatus.class, names = {"READY_FOR_PROVIDER_SIGNATURE", "SIGNED_BY_PROVIDER"}, mode = Mode.EXCLUDE)
    void signByProviderThrowsInvalidTransitionForNonReadyStatus(ValidationStatus status) {
        MonthlyCraReport cra = craWithStatus(status);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.signByProvider(CRA_ID, JULY_31, VALID_IMAGE))
                .isInstanceOf(InvalidCraTransitionException.class);
        verify(craRepository, never()).save(any());
    }

    // --- sendToClient ---

    @Test
    void sendToClientTransitionsToAwaitingClientSignature() {
        MonthlyCraReport cra = craWithStatus(ValidationStatus.SIGNED_BY_PROVIDER);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));
        when(craRepository.save(cra)).thenReturn(cra);

        CraDetailsDto result = service.sendToClient(CRA_ID);

        verify(cra).setStatus(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
        verify(craRepository).save(cra);
        assertThat(result.status()).isEqualTo(CraStatus.AWAITING_CLIENT_SIGNATURE);
    }

    @Test
    void sendToClientThrowsDuplicateWhenAlreadyAwaitingClientSignature() {
        MonthlyCraReport cra = craWithStatus(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.sendToClient(CRA_ID))
                .isInstanceOf(DuplicateCraTransitionException.class);
        verify(craRepository, never()).save(any());
    }

    @ParameterizedTest
    @EnumSource(value = ValidationStatus.class, names = {"SIGNED_BY_PROVIDER", "AWAITING_CLIENT_SIGNATURE"}, mode = Mode.EXCLUDE)
    void sendToClientThrowsInvalidTransitionForNonSignedByProviderStatus(ValidationStatus status) {
        MonthlyCraReport cra = craWithStatus(status);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.sendToClient(CRA_ID))
                .isInstanceOf(InvalidCraTransitionException.class);
        verify(craRepository, never()).save(any());
    }

    private MonthlyCraReport craWithStatus(ValidationStatus status) {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getId()).thenReturn(CRA_ID);
        when(cra.getMonth()).thenReturn(7);
        when(cra.getYear()).thenReturn(2026);
        AtomicReference<ValidationStatus> current = new AtomicReference<>(status);
        when(cra.getStatus()).thenAnswer(inv -> current.get());
        doAnswer(inv -> { current.set(inv.getArgument(0)); return null; }).when(cra).setStatus(any());
        when(cra.getDayEntries()).thenReturn(List.of());
        return cra;
    }
}
