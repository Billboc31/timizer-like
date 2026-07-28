package com.timizerlike.cra.service;

import java.time.Instant;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timizer.backend.cra.ConsentNotGivenException;
import com.timizer.backend.cra.CraClientSignatureRecord;
import com.timizer.backend.cra.CraClientSignatureRecordRepository;
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
    private final ObjectMapper objectMapper;

    public ClientSignatureService(
            CraSignatureTokenService tokenService,
            CraClientSignatureRecordRepository signatureRecordRepository,
            MonthlyCraReportRepository craRepository,
            ObjectMapper objectMapper) {
        this.tokenService = tokenService;
        this.signatureRecordRepository = signatureRecordRepository;
        this.craRepository = craRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional
    public void sign(String rawToken, String signerName, String signerRole,
                     boolean consentApproved, String signatureImageBase64) {
        if (!consentApproved) {
            throw new ConsentNotGivenException();
        }
        if (signatureImageBase64 == null || signatureImageBase64.isBlank()
                || !signatureImageBase64.startsWith("data:image/")) {
            throw new IllegalArgumentException("Invalid signature image");
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

        cra.setStatus(ValidationStatus.VALIDATED);
        craRepository.save(cra);
    }

    private String buildSnapshot(MonthlyCraReport cra) {
        CraPublicViewDto dto = CraSignatureTokenService.toPublicViewDtoStatic(cra);
        try {
            return objectMapper.writeValueAsString(dto);
        } catch (JsonProcessingException e) {
            throw new IllegalStateException("Failed to serialize CRA snapshot", e);
        }
    }
}
