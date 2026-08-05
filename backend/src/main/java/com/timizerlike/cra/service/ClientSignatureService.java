package com.timizerlike.cra.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timizer.backend.cra.ConsentNotGivenException;
import com.timizer.backend.cra.CraTransitionEvent.ActorType;
import com.timizer.backend.cra.CraClientSignatureRecord;
import com.timizer.backend.cra.CraClientSignatureRecordRepository;
import com.timizer.backend.cra.CraDownloadToken;
import com.timizer.backend.cra.CraDownloadTokenRepository;
import com.timizer.backend.cra.InvalidSignatureImageException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraPublicViewDto;
import com.timizerlike.cra.service.CraSignatureTokenService.ConsumedToken;

@Service
public class ClientSignatureService {

    private final CraSignatureTokenService tokenService;
    private final CraClientSignatureRecordRepository signatureRecordRepository;
    private final MonthlyCraReportRepository craRepository;
    private final CraDownloadTokenRepository downloadTokenRepository;
    private final ObjectMapper objectMapper;
    private final CraAuditService auditService;

    public ClientSignatureService(
            CraSignatureTokenService tokenService,
            CraClientSignatureRecordRepository signatureRecordRepository,
            MonthlyCraReportRepository craRepository,
            CraDownloadTokenRepository downloadTokenRepository,
            ObjectMapper objectMapper,
            CraAuditService auditService) {
        this.tokenService = tokenService;
        this.signatureRecordRepository = signatureRecordRepository;
        this.craRepository = craRepository;
        this.downloadTokenRepository = downloadTokenRepository;
        this.objectMapper = objectMapper;
        this.auditService = auditService;
    }

    @Transactional
    public String sign(String rawToken, String signerName, String signerRole,
                       boolean consentApproved, String signatureImageBase64) {
        if (!consentApproved) {
            throw new ConsentNotGivenException();
        }
        if (signatureImageBase64 == null || signatureImageBase64.isBlank()
                || !signatureImageBase64.startsWith("data:image/")) {
            throw new InvalidSignatureImageException();
        }

        ConsumedToken result = tokenService.validateAndConsume(rawToken);
        MonthlyCraReport cra = result.cra();

        String snapshot = buildSnapshot(cra);

        signatureRecordRepository.save(new CraClientSignatureRecord(
                cra.getId(),
                result.token().getId(),
                signerName,
                signerRole,
                true,
                signatureImageBase64,
                snapshot,
                Instant.now()));

        cra.setClientRepresentativeName(signerName);
        cra.setClientSignatureDate(LocalDate.now());
        cra.setClientSignedAt(Instant.now());
        cra.setClientSignatureImage(signatureImageBase64);
        cra.setStatus(ValidationStatus.VALIDATED);
        craRepository.save(cra);

        auditService.recordTransition(cra.getId(), ValidationStatus.AWAITING_CLIENT_SIGNATURE, ValidationStatus.VALIDATED,
                ActorType.CLIENT, signerName);

        String rawDownloadToken = UUID.randomUUID().toString();
        downloadTokenRepository.save(new CraDownloadToken(sha256(rawDownloadToken), cra.getId()));
        return rawDownloadToken;
    }

    private String buildSnapshot(MonthlyCraReport cra) {
        CraPublicViewDto dto = CraSignatureTokenService.toPublicViewDtoStatic(cra);
        try {
            return objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize CRA snapshot", e);
        }
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
