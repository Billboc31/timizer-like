package com.timizer.backend.cra;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.cra.config.CraDefaultsProperties;

@Service
public class MonthlyCraCreationService {

    private static final double WEEKDAY_WORK_VALUE = 1.0;
    private static final double WEEKEND_WORK_VALUE = 0.0;

    private final MonthlyCraReportRepository repository;
    private final CraDefaultsProperties defaults;

    public MonthlyCraCreationService(MonthlyCraReportRepository repository, CraDefaultsProperties defaults) {
        this.repository = repository;
        this.defaults = defaults;
    }

    @Transactional
    public CraCreationResult createForMonth(int year, int month) {
        Optional<MonthlyCraReport> existing = repository.findByMonthAndYear(month, year);
        if (existing.isPresent()) {
            return new CraCreationResult(CraDetailsMapper.toDto(existing.get()), false);
        }

        MonthlyCraReport report = buildReport(year, month);
        YearMonth yearMonth = YearMonth.of(year, month);
        for (int day = 1; day <= yearMonth.lengthOfMonth(); day++) {
            LocalDate date = yearMonth.atDay(day);
            CraDayEntry entry = new CraDayEntry(date, defaultWorkValue(date), null);
            report.addDayEntry(entry);
        }

        MonthlyCraReport saved = repository.save(report);
        return new CraCreationResult(CraDetailsMapper.toDto(saved), true);
    }

    private MonthlyCraReport buildReport(int year, int month) {
        CraDefaultsProperties.Provider provider = defaults.provider();
        CraDefaultsProperties.Client client = defaults.client();
        CraDefaultsProperties.Client.Contact contact = client.contact();

        String[] providerName = splitName(provider.name());
        String[] contactName = splitName(contact.name());

        return new MonthlyCraReport(
                month,
                year,
                providerName[0],
                providerName[1],
                provider.company(),
                contactName[0],
                contactName[1],
                client.name(),
                contact.email(),
                null
        );
    }

    private static double defaultWorkValue(LocalDate date) {
        DayOfWeek dow = date.getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            return WEEKEND_WORK_VALUE;
        }
        return WEEKDAY_WORK_VALUE;
    }

    private static String[] splitName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new String[] {"Unknown", "Unknown"};
        }
        String trimmed = fullName.trim();
        int idx = trimmed.indexOf(' ');
        if (idx < 0) {
            return new String[] {trimmed, trimmed};
        }
        String first = trimmed.substring(0, idx).trim();
        String last = trimmed.substring(idx + 1).trim();
        if (first.isEmpty()) {
            first = trimmed;
        }
        if (last.isEmpty()) {
            last = trimmed;
        }
        return new String[] {first, last};
    }

    public record CraCreationResult(CraDetailsDto cra, boolean created) {
    }
}
