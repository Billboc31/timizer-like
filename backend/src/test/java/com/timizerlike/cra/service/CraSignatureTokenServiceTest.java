package com.timizerlike.cra.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.InvalidCraTransitionException;
import com.timizer.backend.cra.CraSignatureToken;
import com.timizer.backend.cra.CraSignatureTokenRepository;
import com.timizer.backend.cra.CraWrongStatusException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.TokenNotFoundException;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraPublicViewDto;

class CraSignatureTokenServiceTest {

    private static final Long CRA_ID = 1L;

    private CraSignatureTokenRepository tokenRepository;
    private MonthlyCraReportRepository craRepository;
    private CraSignatureTokenService service;

    @BeforeEach
    void setUp() {
        tokenRepository = mock(CraSignatureTokenRepository.class);
        craRepository = mock(MonthlyCraReportRepository.class);
        service = new CraSignatureTokenService(tokenRepository, craRepository);
    }

    // ── generateToken ────────────────────────────────────────────────────────

    @Test
    void generateTokenReturnsNonBlankRawToken() {
        MonthlyCraReport cra = awaitingClientSignatureCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        String rawToken = service.generateToken(CRA_ID);

        assertThat(rawToken).isNotBlank();
    }

    @Test
    void generateTokenSavesHashNotRawToken() {
        MonthlyCraReport cra = awaitingClientSignatureCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        String rawToken = service.generateToken(CRA_ID);

        verify(tokenRepository).save(any(CraSignatureToken.class));
        // Verify the saved entity carries a hash, not the raw token
        var captor = org.mockito.ArgumentCaptor.forClass(CraSignatureToken.class);
        verify(tokenRepository).save(captor.capture());
        assertThat(captor.getValue().getTokenHash()).isNotEqualTo(rawToken);
        assertThat(captor.getValue().getTokenHash()).hasSize(64); // SHA-256 hex = 64 chars
    }

    @Test
    void generateTokenDeletesExistingTokenBeforeSaving() {
        MonthlyCraReport cra = awaitingClientSignatureCra();
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        service.generateToken(CRA_ID);

        verify(tokenRepository).deleteByCraId(CRA_ID);
    }

    @Test
    void generateTokenThrowsCraNotFoundForUnknownCra() {
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.generateToken(CRA_ID))
                .isInstanceOf(CraNotFoundException.class);
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void generateTokenThrowsForDraftCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.DRAFT);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.generateToken(CRA_ID))
                .isInstanceOf(InvalidCraTransitionException.class);
        verify(tokenRepository, never()).save(any());
    }

    @Test
    void generateTokenThrowsForValidatedCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.VALIDATED);
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.generateToken(CRA_ID))
                .isInstanceOf(InvalidCraTransitionException.class);
        verify(tokenRepository, never()).save(any());
    }

    // ── resolveToken ─────────────────────────────────────────────────────────

    @Test
    void resolveTokenReturnsCraPublicViewForValidToken() {
        MonthlyCraReport cra = awaitingClientSignatureCra();
        when(cra.getMonth()).thenReturn(7);
        when(cra.getYear()).thenReturn(2026);
        when(cra.getDayEntries()).thenReturn(List.of());

        CraSignatureToken token = tokenFor(CRA_ID);
        String rawToken = "any-raw-token";
        // We need the actual hash to match — generate it manually
        String hash = sha256hex(rawToken);

        CraSignatureToken realToken = new CraSignatureToken(hash, CRA_ID);
        when(tokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(realToken));
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        CraPublicViewDto result = service.resolveToken(rawToken);

        assertThat(result).isNotNull();
        assertThat(result.month()).isEqualTo(7);
        assertThat(result.year()).isEqualTo(2026);
    }

    @Test
    void resolveTokenThrowsForUnknownHash() {
        when(tokenRepository.findByTokenHash(any())).thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.resolveToken("bad-token"))
                .isInstanceOf(TokenNotFoundException.class);
    }

    @Test
    void resolveTokenThrowsForRevokedToken() {
        CraSignatureToken revokedToken = mock(CraSignatureToken.class);
        when(revokedToken.isRevoked()).thenReturn(true);
        when(tokenRepository.findByTokenHash(any())).thenReturn(Optional.of(revokedToken));

        assertThatThrownBy(() -> service.resolveToken("some-token"))
                .isInstanceOf(TokenNotFoundException.class);
    }

    @Test
    void resolveTokenThrowsCraWrongStatusWhenCraNotAwaitingClientSignature() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getStatus()).thenReturn(ValidationStatus.VALIDATED);

        String rawToken = "valid-token";
        String hash = sha256hex(rawToken);
        CraSignatureToken token = new CraSignatureToken(hash, CRA_ID);
        when(tokenRepository.findByTokenHash(hash)).thenReturn(Optional.of(token));
        when(craRepository.findById(CRA_ID)).thenReturn(Optional.of(cra));

        assertThatThrownBy(() -> service.resolveToken(rawToken))
                .isInstanceOf(CraWrongStatusException.class);
    }

    // ── revokeToken ──────────────────────────────────────────────────────────

    @Test
    void revokeTokenDeletesRepositoryEntry() {
        service.revokeToken(CRA_ID);

        verify(tokenRepository).deleteByCraId(CRA_ID);
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private MonthlyCraReport awaitingClientSignatureCra() {
        MonthlyCraReport cra = mock(MonthlyCraReport.class);
        when(cra.getId()).thenReturn(CRA_ID);
        when(cra.getStatus()).thenReturn(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
        when(cra.getDayEntries()).thenReturn(List.of());
        return cra;
    }

    private static CraSignatureToken tokenFor(Long craId) {
        return new CraSignatureToken("somehash", craId);
    }

    private static String sha256hex(String input) {
        try {
            var digest = java.security.MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            var sb = new StringBuilder(64);
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (java.security.NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
