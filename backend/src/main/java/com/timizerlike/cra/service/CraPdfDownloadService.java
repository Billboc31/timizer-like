package com.timizerlike.cra.service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.YearMonth;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.CraDayEntry;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraNotValidatedException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.cra.pdf.CraPdfGenerator;
import com.timizerlike.cra.pdf.model.CraPdfContact;
import com.timizerlike.cra.pdf.model.CraPdfDayEntry;
import com.timizerlike.cra.pdf.model.CraPdfDayType;
import com.timizerlike.cra.pdf.model.CraPdfDocument;
import com.timizerlike.cra.pdf.model.CraPdfParty;
import com.timizerlike.cra.pdf.model.CraPdfProviderSignature;
import com.timizerlike.cra.pdf.model.CraPdfSignatures;
import com.timizerlike.cra.pdf.model.CraPdfSummary;

@Service
public class CraPdfDownloadService {

    private final MonthlyCraReportRepository craRepository;
    private final CraPdfGenerator pdfGenerator;

    public CraPdfDownloadService(MonthlyCraReportRepository craRepository, CraPdfGenerator pdfGenerator) {
        this.craRepository = craRepository;
        this.pdfGenerator = pdfGenerator;
    }

    @Transactional(readOnly = true)
    public CraPdfDownloadResult download(Long craId) {
        MonthlyCraReport cra = craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));

        if (cra.getStatus() != ValidationStatus.VALIDATED) {
            throw new CraNotValidatedException(craId);
        }

        CraPdfDocument document = toDocument(cra);
        byte[] content = pdfGenerator.generate(document);
        String filename = buildFilename(cra);

        return new CraPdfDownloadResult(content, filename);
    }

    private CraPdfDocument toDocument(MonthlyCraReport cra) {
        YearMonth period = YearMonth.of(cra.getYear(), cra.getMonth());

        CraPdfParty provider = new CraPdfParty(
                cra.getProviderFirstName() + " " + cra.getProviderLastName(),
                cra.getProviderCompany(),
                null,
                null);

        CraPdfParty client = new CraPdfParty(
                cra.getClientFirstName() + " " + cra.getClientLastName(),
                cra.getClientCompany(),
                null,
                new CraPdfContact(null, cra.getClientContactEmail()));

        BigDecimal total = cra.getDayEntries().stream()
                .map(e -> BigDecimal.valueOf(e.getWorkValue()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CraPdfSummary summary = new CraPdfSummary(period, provider, client, total);

        List<CraPdfDayEntry> days = cra.getDayEntries().stream()
                .sorted(java.util.Comparator.comparing(CraDayEntry::getDate))
                .map(this::toPdfDayEntry)
                .toList();

        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature(
                        cra.getProviderFirstName() + " " + cra.getProviderLastName(),
                        cra.getProviderSignatureDate(),
                        null),
                null);

        return new CraPdfDocument(summary, days, signatures);
    }

    private CraPdfDayEntry toPdfDayEntry(CraDayEntry entry) {
        DayOfWeek dayOfWeek = entry.getDate().getDayOfWeek();
        double workValue = entry.getWorkValue();
        CraPdfDayType type = resolveDayType(dayOfWeek, workValue);
        return new CraPdfDayEntry(entry.getDate(), dayOfWeek, type, BigDecimal.valueOf(workValue), entry.getNote());
    }

    private CraPdfDayType resolveDayType(DayOfWeek dayOfWeek, double workValue) {
        if (workValue == 1.0) {
            return CraPdfDayType.WORKED_FULL;
        }
        if (workValue == 0.5) {
            return CraPdfDayType.WORKED_HALF;
        }
        if (dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY) {
            return CraPdfDayType.WEEKEND;
        }
        return CraPdfDayType.NOT_WORKED;
    }

    private String buildFilename(MonthlyCraReport cra) {
        String provider = sanitize(cra.getProviderCompany());
        String client = sanitize(cra.getClientCompany());
        String period = String.format("%04d-%02d", cra.getYear(), cra.getMonth());
        return "CRA-" + provider + "-" + client + "-" + period + ".pdf";
    }

    private String sanitize(String value) {
        if (value == null) {
            return "";
        }
        return value.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
