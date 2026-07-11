package com.timizerlike.cra.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.CraDayEntry;
import com.timizer.backend.cra.CraDayEntryRepository;
import com.timizer.backend.cra.CraDayNotFoundException;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraValidatedException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDayEntryDto;
import com.timizerlike.backend.cra.dto.CraDayUpdateRequestDto;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;

@Service
public class CraDayUpdateService {

    private final MonthlyCraReportRepository craRepository;
    private final CraDayEntryRepository dayEntryRepository;

    public CraDayUpdateService(MonthlyCraReportRepository craRepository, CraDayEntryRepository dayEntryRepository) {
        this.craRepository = craRepository;
        this.dayEntryRepository = dayEntryRepository;
    }

    @Transactional
    public CraDetailsDto updateDay(Long craId, LocalDate date, CraDayUpdateRequestDto request) {
        MonthlyCraReport cra = craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));

        if (cra.getStatus() != ValidationStatus.DRAFT) {
            throw new CraValidatedException(craId);
        }

        CraDayEntry entry = dayEntryRepository.findByMonthlyCraReport_IdAndDate(craId, date)
                .orElseThrow(() -> new CraDayNotFoundException(craId, date));

        if (request.workValue() != null) {
            entry.updateWorkValue(request.workValue());
        }
        if (request.note() != null) {
            entry.setNote(request.note().isEmpty() ? null : request.note());
        }

        dayEntryRepository.save(entry);

        List<CraDayEntry> allEntries = dayEntryRepository.findByMonthlyCraReport_IdOrderByDateAsc(craId);
        return buildDto(cra, allEntries);
    }

    private static CraDetailsDto buildDto(MonthlyCraReport cra, List<CraDayEntry> entries) {
        List<CraDayEntryDto> days = new ArrayList<>(entries.size());
        double total = 0.0;
        for (CraDayEntry e : entries) {
            days.add(new CraDayEntryDto(e.getDate().getDayOfMonth(), e.getWorkValue(), e.getNote()));
            total += e.getWorkValue();
        }
        CraStatus status = cra.getStatus() == ValidationStatus.VALIDATED ? CraStatus.VALIDATED : CraStatus.DRAFT;
        return new CraDetailsDto(cra.getId(), cra.getMonth(), cra.getYear(), total, status, days,
                cra.getValidationDate(), cra.getProviderSignatureDate());
    }
}
