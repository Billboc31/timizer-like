package com.timizerlike.cra.service;

import java.time.Instant;
import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.CraAlreadyClientSignedException;
import com.timizer.backend.cra.CraDetailsMapper;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraNotValidatedException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDetailsDto;

@Service
public class CraClientSignService {

    private final MonthlyCraReportRepository craRepository;

    public CraClientSignService(MonthlyCraReportRepository craRepository) {
        this.craRepository = craRepository;
    }

    @Transactional
    public CraDetailsDto clientSign(Long craId, String clientRepresentativeName, LocalDate clientSignatureDate, String signatureImageBase64) {
        MonthlyCraReport cra = craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));

        if (cra.getStatus() != ValidationStatus.VALIDATED) {
            throw new CraNotValidatedException(craId);
        }

        if (cra.getClientSignatureDate() != null) {
            throw new CraAlreadyClientSignedException(craId);
        }

        cra.setClientRepresentativeName(clientRepresentativeName);
        cra.setClientSignatureDate(clientSignatureDate);
        cra.setClientSignedAt(Instant.now());
        if (signatureImageBase64 != null && !signatureImageBase64.isBlank()) {
            cra.setClientSignatureImage(signatureImageBase64);
        }

        craRepository.save(cra);

        return CraDetailsMapper.toDto(cra);
    }
}
