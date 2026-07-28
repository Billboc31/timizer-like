package com.timizerlike.cra.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.CraDetailsMapper;
import com.timizer.backend.cra.CraTotalCalculationService;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizerlike.backend.cra.dto.CraStatus;
import com.timizerlike.backend.cra.dto.CraSummaryDto;

@Service
public class CraHistoryService {

    private final MonthlyCraReportRepository craRepository;
    private final CraTotalCalculationService calculationService;

    public CraHistoryService(MonthlyCraReportRepository craRepository,
            CraTotalCalculationService calculationService) {
        this.craRepository = craRepository;
        this.calculationService = calculationService;
    }

    @Transactional(readOnly = true)
    public List<CraSummaryDto> listHistory() {
        return craRepository.findAllByOrderByYearDescMonthDesc()
                .stream()
                .map(this::toSummary)
                .toList();
    }

    private CraSummaryDto toSummary(MonthlyCraReport report) {
        double total = calculationService.calculateTotalWorkedDays(report.getDayEntries());
        CraStatus status = CraDetailsMapper.mapStatus(report.getStatus());
        return new CraSummaryDto(
                report.getId(),
                report.getMonth(),
                report.getYear(),
                total,
                status,
                report.getValidationDate()
        );
    }
}
