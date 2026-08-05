package com.timizerlike.cra.service;

import java.util.Set;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.CraClientSignatureRecordRepository;
import com.timizer.backend.cra.CraDownloadTokenRepository;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraNotDeletableException;
import com.timizer.backend.cra.CraSignatureTokenRepository;
import com.timizer.backend.cra.CraTransitionEventRepository;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;

@Service
public class CraDeleteService {

    private static final Set<ValidationStatus> NON_DELETABLE = Set.of(
            ValidationStatus.AWAITING_CLIENT_SIGNATURE,
            ValidationStatus.FULLY_SIGNED,
            ValidationStatus.VALIDATED);

    private final MonthlyCraReportRepository craRepository;
    private final CraClientSignatureRecordRepository clientSignatureRecordRepository;
    private final CraSignatureTokenRepository signatureTokenRepository;
    private final CraDownloadTokenRepository downloadTokenRepository;
    private final CraTransitionEventRepository transitionEventRepository;

    public CraDeleteService(
            MonthlyCraReportRepository craRepository,
            CraClientSignatureRecordRepository clientSignatureRecordRepository,
            CraSignatureTokenRepository signatureTokenRepository,
            CraDownloadTokenRepository downloadTokenRepository,
            CraTransitionEventRepository transitionEventRepository) {
        this.craRepository = craRepository;
        this.clientSignatureRecordRepository = clientSignatureRecordRepository;
        this.signatureTokenRepository = signatureTokenRepository;
        this.downloadTokenRepository = downloadTokenRepository;
        this.transitionEventRepository = transitionEventRepository;
    }

    @Transactional
    public void delete(Long craId) {
        MonthlyCraReport cra = craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));

        if (NON_DELETABLE.contains(cra.getStatus())) {
            throw new CraNotDeletableException(craId);
        }

        clientSignatureRecordRepository.deleteAllByCraId(craId);
        signatureTokenRepository.deleteByCraId(craId);
        downloadTokenRepository.deleteAllByCraId(craId);
        transitionEventRepository.deleteAllByCraId(craId);
        craRepository.delete(cra);
    }
}
