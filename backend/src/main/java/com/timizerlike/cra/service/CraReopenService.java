package com.timizerlike.cra.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraTransitionEvent.ActorType;
import com.timizer.backend.cra.CraValidatedException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;

@Service
public class CraReopenService {

    private final MonthlyCraReportRepository craRepository;
    private final CraSignatureTokenService tokenService;
    private final CraAuditService auditService;

    public CraReopenService(
            MonthlyCraReportRepository craRepository,
            CraSignatureTokenService tokenService,
            CraAuditService auditService) {
        this.craRepository = craRepository;
        this.tokenService = tokenService;
        this.auditService = auditService;
    }

    @Transactional
    public void reopen(Long craId) {
        MonthlyCraReport cra = craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));

        if (cra.getStatus() == ValidationStatus.VALIDATED
                || cra.getStatus() == ValidationStatus.FULLY_SIGNED) {
            throw new CraValidatedException(craId);
        }

        if (cra.getStatus() == ValidationStatus.DRAFT) {
            return;
        }

        ValidationStatus previousStatus = cra.getStatus();

        tokenService.revokeToken(craId);

        cra.clearProviderSignature();
        cra.clearClientSignature();
        cra.setStatus(ValidationStatus.DRAFT);
        craRepository.save(cra);

        auditService.recordInvalidation(craId, previousStatus, "manual reopen by consultant");
    }
}
