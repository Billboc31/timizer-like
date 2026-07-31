package com.timizerlike.cra.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.timizer.backend.cra.CraDetailsMapper;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraTransitionEvent.ActorType;
import com.timizer.backend.cra.CraValidatedException;
import com.timizer.backend.cra.CraValidationBlockedException;
import com.timizer.backend.cra.CraValidationBlockingReason;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDetailsDto;

@Service
public class CraValidationService {

    private final MonthlyCraReportRepository craRepository;
    private final ObjectMapper objectMapper;
    private final CraAuditService auditService;

    public CraValidationService(MonthlyCraReportRepository craRepository, ObjectMapper objectMapper,
                                CraAuditService auditService) {
        this.craRepository = craRepository;
        this.objectMapper = objectMapper;
        this.auditService = auditService;
    }

    @Transactional
    public CraDetailsDto validate(Long craId, LocalDate providerSignatureDate,
                                  String providerSignatureImage, String providerSignerName) {
        MonthlyCraReport cra = craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));

        if (cra.getStatus() != ValidationStatus.DRAFT) {
            throw new CraValidatedException(craId);
        }

        List<CraValidationBlockingReason> reasons = new ArrayList<>();

        if (providerSignatureImage == null || providerSignatureImage.isBlank()
                || !providerSignatureImage.startsWith("data:image/")) {
            reasons.add(CraValidationBlockingReason.INVALID_SIGNATURE_IMAGE);
        }

        if (!reasons.isEmpty()) {
            throw new CraValidationBlockedException(reasons);
        }

        String contentHash = computeContentHash(cra);

        cra.setStatus(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
        cra.setProviderSignatureDate(providerSignatureDate);
        cra.setProviderSignatureImage(providerSignatureImage);
        cra.setProviderSignerName(providerSignerName);
        cra.setValidationDate(LocalDate.now());
        cra.setProviderContentHash(contentHash);

        craRepository.save(cra);

        auditService.recordTransition(craId, ValidationStatus.DRAFT, ValidationStatus.AWAITING_CLIENT_SIGNATURE,
                ActorType.CONSULTANT, providerSignerName);

        return CraDetailsMapper.toDto(cra);
    }

    private String computeContentHash(MonthlyCraReport cra) {
        try {
            String json = objectMapper.writeValueAsString(
                    CraSignatureTokenService.toPublicViewDtoStatic(cra));
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(json.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (JsonProcessingException | NoSuchAlgorithmException e) {
            throw new IllegalStateException("Failed to compute CRA content hash", e);
        }
    }
}
