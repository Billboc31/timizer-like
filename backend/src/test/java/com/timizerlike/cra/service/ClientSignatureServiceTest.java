package com.timizerlike.cra.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.timizer.backend.cra.ConsentNotGivenException;
import com.timizer.backend.cra.InvalidSignatureImageException;
import com.timizer.backend.cra.CraClientSignatureRecord;
import com.timizer.backend.cra.CraClientSignatureRecordRepository;
import com.timizer.backend.cra.CraSignatureToken;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.TokenAlreadyConsumedException;
import com.timizer.backend.cra.TokenNotFoundException;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.cra.service.CraSignatureTokenService.ConsumedToken;

class ClientSignatureServiceTest {

    private static final String VALID_TOKEN = "valid-raw-token";
    private static final String SIGNER_NAME = "Bob Martin";
    private static final String VALID_SIGNATURE = "data:image/png;base64,abc123";

    private CraSignatureTokenService tokenService;
    private CraClientSignatureRecordRepository recordRepository;
    private MonthlyCraReportRepository craRepository;
    private CraAuditService auditService;
    private ClientSignatureService service;

    @BeforeEach
    void setUp() {
        tokenService = mock(CraSignatureTokenService.class);
        recordRepository = mock(CraClientSignatureRecordRepository.class);
        craRepository = mock(MonthlyCraReportRepository.class);
        auditService = mock(CraAuditService.class);
        service = new ClientSignatureService(tokenService, recordRepository, craRepository, new ObjectMapper(), auditService);
    }

    @Test
    void happyPathPersistsRecordAndTransitionsCraToValidated() {
        MonthlyCraReport cra = awaitingClientSignatureCra();
        CraSignatureToken token = new CraSignatureToken("hash", 1L);
        when(tokenService.validateAndConsume(VALID_TOKEN)).thenReturn(new ConsumedToken(token, cra));
        when(craRepository.save(cra)).thenReturn(cra);

        service.sign(VALID_TOKEN, SIGNER_NAME, null, true, VALID_SIGNATURE);

        verify(recordRepository).save(any(CraClientSignatureRecord.class));
        verify(cra).setStatus(ValidationStatus.VALIDATED);
        verify(craRepository).save(cra);
    }

    // F4: sign() propagates clientRepresentativeName, clientSignedAt, and clientSignatureImage to entity
    @Test
    void signPropagatesClientDataToEntity() {
        MonthlyCraReport cra = signedByProviderCra();
        CraSignatureToken token = new CraSignatureToken("hash", 1L);
        when(tokenService.validateAndConsume(VALID_TOKEN)).thenReturn(new ConsumedToken(token, cra));
        when(craRepository.save(cra)).thenReturn(cra);
        Instant before = Instant.now();

        service.sign(VALID_TOKEN, SIGNER_NAME, "Responsable Achats", true, VALID_SIGNATURE);

        verify(cra).setClientRepresentativeName(SIGNER_NAME);
        verify(cra).setClientSignatureImage(VALID_SIGNATURE);
        ArgumentCaptor<Instant> captor = ArgumentCaptor.forClass(Instant.class);
        verify(cra).setClientSignedAt(captor.capture());
        assertThat(captor.getValue()).isAfterOrEqualTo(before);
    }

    @Test
    void throwsConsentNotGivenWhenConsentIsFalse() {
        assertThatThrownBy(() ->
                service.sign(VALID_TOKEN, SIGNER_NAME, null, false, VALID_SIGNATURE))
                .isInstanceOf(ConsentNotGivenException.class);

        verify(tokenService, never()).validateAndConsume(any());
        verify(recordRepository, never()).save(any());
    }

    @Test
    void throwsInvalidSignatureImageWhenSignatureImageIsBlank() {
        assertThatThrownBy(() ->
                service.sign(VALID_TOKEN, SIGNER_NAME, null, true, ""))
                .isInstanceOf(InvalidSignatureImageException.class);

        verify(tokenService, never()).validateAndConsume(any());
    }

    @Test
    void throwsInvalidSignatureImageWhenSignatureImageHasWrongPrefix() {
        assertThatThrownBy(() ->
                service.sign(VALID_TOKEN, SIGNER_NAME, null, true, "base64,abc"))
                .isInstanceOf(InvalidSignatureImageException.class);

        verify(tokenService, never()).validateAndConsume(any());
    }

    @Test
    void propagatesTokenNotFoundFromTokenService() {
        when(tokenService.validateAndConsume(VALID_TOKEN)).thenThrow(new TokenNotFoundException());

        assertThatThrownBy(() ->
                service.sign(VALID_TOKEN, SIGNER_NAME, null, true, VALID_SIGNATURE))
                .isInstanceOf(TokenNotFoundException.class);

        verify(recordRepository, never()).save(any());
    }

    @Test
    void propagatesTokenAlreadyConsumedFromTokenService() {
        when(tokenService.validateAndConsume(VALID_TOKEN)).thenThrow(new TokenAlreadyConsumedException());

        assertThatThrownBy(() ->
                service.sign(VALID_TOKEN, SIGNER_NAME, null, true, VALID_SIGNATURE))
                .isInstanceOf(TokenAlreadyConsumedException.class);

        verify(recordRepository, never()).save(any());
    }

    private MonthlyCraReport awaitingClientSignatureCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getId()).thenReturn(1L);
        when(cra.getMonth()).thenReturn(7);
        when(cra.getYear()).thenReturn(2026);
        when(cra.getStatus()).thenReturn(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
        when(cra.getDayEntries()).thenReturn(List.of());
        return cra;
    }
}
