package com.timizerlike.cra.service;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.CraDayEntry;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizerlike.cra.config.CraDefaultsProperties;
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
public class CraPdfAssemblerService {

    private static final CraPdfGenerator PDF_GENERATOR = new CraPdfGenerator();

    private final MonthlyCraReportRepository craRepository;
    private final CraDefaultsProperties defaults;

    public CraPdfAssemblerService(MonthlyCraReportRepository craRepository, CraDefaultsProperties defaults) {
        this.craRepository = craRepository;
        this.defaults = defaults;
    }

    @Transactional(readOnly = true)
    public byte[] generatePdf(Long craId) {
        MonthlyCraReport cra = craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));
        CraPdfDocument document = toDocument(cra);
        return PDF_GENERATOR.generate(document);
    }

    private CraPdfDocument toDocument(MonthlyCraReport cra) {
        YearMonth period = YearMonth.of(cra.getYear(), cra.getMonth());
        String providerName = cra.getProviderFirstName() + " " + cra.getProviderLastName();

        CraPdfParty provider = new CraPdfParty(
                providerName,
                cra.getProviderCompany(),
                defaults.provider().address(),
                null);

        CraPdfParty client = new CraPdfParty(
                cra.getClientCompany(),
                null,
                defaults.client().address(),
                new CraPdfContact(
                        cra.getClientFirstName() + " " + cra.getClientLastName(),
                        cra.getClientContactEmail()));

        BigDecimal total = cra.getDayEntries().stream()
                .map(e -> BigDecimal.valueOf(e.getWorkValue()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        CraPdfSummary summary = new CraPdfSummary(period, provider, client, total);

        List<CraPdfDayEntry> days = cra.getDayEntries().stream()
                .sorted(Comparator.comparing(CraDayEntry::getDate))
                .map(this::toPdfDayEntry)
                .toList();

        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature(providerName, cra.getProviderSignatureDate(), null),
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
}
