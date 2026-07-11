package com.timizerlike.cra.service;

import java.time.LocalDate;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.CraDetailsMapper;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraValidatedException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDetailsDto;

@Service
public class CraValidationService {

    private final MonthlyCraReportRepository craRepository;

    public CraValidationService(MonthlyCraReportRepository craRepository) {
        this.craRepository = craRepository;
    }

    @Transactional
    public CraDetailsDto validate(Long craId, LocalDate providerSignatureDate) {
        MonthlyCraReport cra = craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));

        if (cra.getStatus() != ValidationStatus.DRAFT) {
            throw new CraValidatedException(craId);
        }

        cra.setStatus(ValidationStatus.VALIDATED);
        cra.setProviderSignatureDate(providerSignatureDate);
        cra.setValidationDate(LocalDate.now());

        craRepository.save(cra);

        return CraDetailsMapper.toDto(cra);
    }
}
