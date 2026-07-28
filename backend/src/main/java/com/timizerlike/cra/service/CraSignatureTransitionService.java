package com.timizerlike.cra.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.CraDetailsMapper;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.DuplicateCraTransitionException;
import com.timizer.backend.cra.InvalidCraTransitionException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDetailsDto;

@Service
public class CraSignatureTransitionService {

    private final MonthlyCraReportRepository craRepository;

    public CraSignatureTransitionService(MonthlyCraReportRepository craRepository) {
        this.craRepository = craRepository;
    }

    @Transactional
    public CraDetailsDto submit(Long craId) {
        MonthlyCraReport cra = findCra(craId);
        if (cra.getStatus() == ValidationStatus.READY_FOR_PROVIDER_SIGNATURE) {
            throw new DuplicateCraTransitionException(craId, ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
        }
        if (cra.getStatus() != ValidationStatus.DRAFT) {
            throw new InvalidCraTransitionException(craId, cra.getStatus(), "submit");
        }
        cra.setStatus(ValidationStatus.READY_FOR_PROVIDER_SIGNATURE);
        craRepository.save(cra);
        return CraDetailsMapper.toDto(cra);
    }

    @Transactional
    public CraDetailsDto signByProvider(Long craId, LocalDate providerSignatureDate) {
        MonthlyCraReport cra = findCra(craId);
        if (cra.getStatus() == ValidationStatus.SIGNED_BY_PROVIDER) {
            throw new DuplicateCraTransitionException(craId, ValidationStatus.SIGNED_BY_PROVIDER);
        }
        if (cra.getStatus() != ValidationStatus.READY_FOR_PROVIDER_SIGNATURE) {
            throw new InvalidCraTransitionException(craId, cra.getStatus(), "sign-provider");
        }
        cra.setStatus(ValidationStatus.SIGNED_BY_PROVIDER);
        cra.setProviderSignatureDate(providerSignatureDate);
        craRepository.save(cra);
        return CraDetailsMapper.toDto(cra);
    }

    @Transactional
    public CraDetailsDto sendToClient(Long craId) {
        MonthlyCraReport cra = findCra(craId);
        if (cra.getStatus() == ValidationStatus.AWAITING_CLIENT_SIGNATURE) {
            throw new DuplicateCraTransitionException(craId, ValidationStatus.AWAITING_CLIENT_SIGNATURE);
        }
        if (cra.getStatus() != ValidationStatus.SIGNED_BY_PROVIDER) {
            throw new InvalidCraTransitionException(craId, cra.getStatus(), "send-to-client");
        }
        cra.setStatus(ValidationStatus.AWAITING_CLIENT_SIGNATURE);
        craRepository.save(cra);
        return CraDetailsMapper.toDto(cra);
    }

    private MonthlyCraReport findCra(Long craId) {
        return craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));
    }
}
