package com.timizerlike.cra.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.InvalidCraTransitionException;
import com.timizer.backend.cra.CraSignatureToken;
import com.timizer.backend.cra.CraSignatureTokenRepository;
import com.timizer.backend.cra.CraWrongStatusException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.TokenAlreadyConsumedException;
import com.timizer.backend.cra.TokenExpiredException;
import com.timizer.backend.cra.TokenNotFoundException;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDayEntryDto;
import com.timizerlike.backend.cra.dto.CraPublicViewDto;

@Service
public class CraSignatureTokenService {

    public record ConsumedToken(CraSignatureToken token, MonthlyCraReport cra) {}


    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private final CraSignatureTokenRepository tokenRepository;
    private final MonthlyCraReportRepository craRepository;

    public CraSignatureTokenService(
            CraSignatureTokenRepository tokenRepository,
            MonthlyCraReportRepository craRepository) {
        this.tokenRepository = tokenRepository;
        this.craRepository = craRepository;
    }

    @Transactional
    public String generateToken(Long craId) {
        MonthlyCraReport cra = craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));

        if (cra.getStatus() != ValidationStatus.AWAITING_CLIENT_SIGNATURE) {
            throw new InvalidCraTransitionException(craId, cra.getStatus(), "generate-token");
        }

        tokenRepository.deleteByCraId(craId);
        tokenRepository.flush();

        byte[] rawBytes = new byte[32];
        SECURE_RANDOM.nextBytes(rawBytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(rawBytes);

        tokenRepository.save(new CraSignatureToken(sha256(rawToken), craId));

        return rawToken;
    }

    @Transactional(readOnly = true)
    public CraPublicViewDto resolveToken(String rawToken) {
        String hash = sha256(rawToken);

        CraSignatureToken token = tokenRepository.findByTokenHash(hash)
                .orElseThrow(TokenNotFoundException::new);

        if (token.isRevoked()) {
            throw new TokenNotFoundException();
        }

        if (token.isExpired()) {
            throw new TokenExpiredException();
        }

        MonthlyCraReport cra = craRepository.findById(token.getCraId())
                .orElseThrow(TokenNotFoundException::new);

        if (cra.getStatus() != ValidationStatus.AWAITING_CLIENT_SIGNATURE) {
            throw new CraWrongStatusException();
        }

        return toPublicViewDto(cra);
    }

    @Transactional
    public ConsumedToken validateAndConsume(String rawToken) {
        String hash = sha256(rawToken);

        CraSignatureToken token = tokenRepository.findByTokenHash(hash)
                .orElseThrow(TokenNotFoundException::new);

        if (token.isRevoked()) {
            throw new TokenNotFoundException();
        }

        if (token.isExpired()) {
            throw new TokenExpiredException();
        }

        if (token.isConsumed()) {
            throw new TokenAlreadyConsumedException();
        }

        MonthlyCraReport cra = craRepository.findById(token.getCraId())
                .orElseThrow(TokenNotFoundException::new);

        if (cra.getStatus() != ValidationStatus.AWAITING_CLIENT_SIGNATURE) {
            throw new TokenAlreadyConsumedException();
        }

        token.consume();
        tokenRepository.save(token);

        return new ConsumedToken(token, cra);
    }

    @Transactional
    public void revokeToken(Long craId) {
        tokenRepository.deleteByCraId(craId);
    }

    public static CraPublicViewDto toPublicViewDtoStatic(MonthlyCraReport cra) {
        return toPublicViewDto(cra);
    }

    private static CraPublicViewDto toPublicViewDto(MonthlyCraReport cra) {
        List<CraDayEntryDto> dayEntries = new ArrayList<>();
        double total = 0.0;
        for (var entry : cra.getDayEntries()) {
            dayEntries.add(new CraDayEntryDto(
                    entry.getDate().getDayOfMonth(),
                    entry.getWorkValue(),
                    entry.getNote()));
            total += entry.getWorkValue();
        }
        return new CraPublicViewDto(
                cra.getId(),
                cra.getStatus().name(),
                cra.getMonth(),
                cra.getYear(),
                cra.getProviderFirstName(),
                cra.getProviderLastName(),
                cra.getProviderCompany(),
                cra.getClientFirstName(),
                cra.getClientLastName(),
                cra.getClientCompany(),
                cra.getClientContactEmail(),
                cra.getProviderSignatureDate(),
                total,
                dayEntries);
    }

    private static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
