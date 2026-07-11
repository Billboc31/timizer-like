package com.timizer.backend.cra;

import static org.assertj.core.api.Assertions.assertThat;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class MonthlyCraReportRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private MonthlyCraReportRepository repository;

    private static MonthlyCraReport newReport(int month, int year) {
        return new MonthlyCraReport(
            month,
            year,
            "Alice",
            "Provider",
            "Provider Co.",
            "Bob",
            "Client",
            "Client Co.",
            "bob.client@example.com",
            "+33123456789"
        );
    }

    private static CraDayEntry newDayEntry(int year, int month, int day, double workValue) {
        return new CraDayEntry(LocalDate.of(year, month, day), workValue, null);
    }

    @Test
    void savesReportWithDayEntriesAndAssignsIdentifiers() {
        MonthlyCraReport report = newReport(6, 2026);
        report.addDayEntry(newDayEntry(2026, 6, 1, 1.0));
        report.addDayEntry(newDayEntry(2026, 6, 2, 0.5));

        MonthlyCraReport saved = repository.save(report);
        entityManager.flush();
        entityManager.clear();

        assertThat(saved.getId()).isNotNull();

        MonthlyCraReport reloaded = repository.findById(saved.getId()).orElseThrow();
        assertThat(reloaded.getDayEntries()).hasSize(2);
        assertThat(reloaded.getDayEntries())
            .allSatisfy(entry -> assertThat(entry.getId()).isNotNull())
            .allSatisfy(entry -> assertThat(entry.getMonthlyCraReport().getId())
                .isEqualTo(reloaded.getId()));
    }

    @Test
    void findByIdReturnsReportWithDayEntries() {
        MonthlyCraReport report = newReport(7, 2026);
        report.addDayEntry(newDayEntry(2026, 7, 3, 1.0));
        MonthlyCraReport saved = repository.save(report);
        entityManager.flush();
        entityManager.clear();

        Optional<MonthlyCraReport> found = repository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getDayEntries())
            .extracting(CraDayEntry::getDate)
            .containsExactly(LocalDate.of(2026, 7, 3));
    }

    @Test
    void findByMonthAndYearReturnsMatchingReport() {
        MonthlyCraReport report = newReport(8, 2026);
        repository.save(report);
        entityManager.flush();
        entityManager.clear();

        Optional<MonthlyCraReport> found = repository.findByMonthAndYear(8, 2026);

        assertThat(found).isPresent();
        assertThat(found.get().getMonth()).isEqualTo(8);
        assertThat(found.get().getYear()).isEqualTo(2026);
    }

    @Test
    void findByMonthAndYearReturnsEmptyWhenNoMatch() {
        Optional<MonthlyCraReport> found = repository.findByMonthAndYear(1, 2099);

        assertThat(found).isEmpty();
    }

    @Test
    void findAllByOrderByYearDescMonthDescReturnsReportsInDescendingPeriodOrder() {
        repository.save(newReport(3, 2025));
        repository.save(newReport(11, 2026));
        repository.save(newReport(2, 2026));
        entityManager.flush();
        entityManager.clear();

        List<MonthlyCraReport> reports = repository.findAllByOrderByYearDescMonthDesc();

        assertThat(reports)
            .extracting(r -> r.getYear() * 100 + r.getMonth())
            .containsExactly(
                2026 * 100 + 11,
                2026 * 100 + 2,
                2025 * 100 + 3
            );
    }

    @Test
    void updatingReportPersistsChangeAndAdvancesUpdatedAt() throws InterruptedException {
        MonthlyCraReport report = newReport(9, 2026);
        MonthlyCraReport saved = repository.save(report);
        entityManager.flush();
        Instant originalUpdatedAt = saved.getUpdatedAt();
        entityManager.clear();

        Thread.sleep(10);

        MonthlyCraReport loaded = repository.findById(saved.getId()).orElseThrow();
        loaded.setStatus(ValidationStatus.SIGNED_BY_PROVIDER);
        repository.save(loaded);
        entityManager.flush();
        entityManager.clear();

        MonthlyCraReport reloaded = repository.findById(saved.getId()).orElseThrow();
        assertThat(reloaded.getStatus()).isEqualTo(ValidationStatus.SIGNED_BY_PROVIDER);
        assertThat(reloaded.getUpdatedAt()).isAfter(originalUpdatedAt);
    }

    @Test
    void addingDayEntryToPersistedReportIsCascadedOnSave() {
        MonthlyCraReport report = newReport(10, 2026);
        MonthlyCraReport saved = repository.save(report);
        entityManager.flush();
        entityManager.clear();

        MonthlyCraReport loaded = repository.findById(saved.getId()).orElseThrow();
        loaded.addDayEntry(newDayEntry(2026, 10, 5, 1.0));
        repository.save(loaded);
        entityManager.flush();
        entityManager.clear();

        MonthlyCraReport reloaded = repository.findById(saved.getId()).orElseThrow();
        assertThat(reloaded.getDayEntries()).hasSize(1);
        assertThat(reloaded.getDayEntries().get(0).getId()).isNotNull();
    }

    @Test
    void removingDayEntryFromPersistedReportTriggersOrphanRemoval() {
        MonthlyCraReport report = newReport(11, 2026);
        report.addDayEntry(newDayEntry(2026, 11, 1, 1.0));
        report.addDayEntry(newDayEntry(2026, 11, 2, 0.5));
        MonthlyCraReport saved = repository.save(report);
        entityManager.flush();
        entityManager.clear();

        MonthlyCraReport loaded = repository.findById(saved.getId()).orElseThrow();
        assertThat(loaded.getDayEntries()).hasSize(2);
        CraDayEntry toRemove = loaded.getDayEntries().get(0);
        loaded.removeDayEntry(toRemove);
        repository.save(loaded);
        entityManager.flush();
        entityManager.clear();

        MonthlyCraReport reloaded = repository.findById(saved.getId()).orElseThrow();
        assertThat(reloaded.getDayEntries()).hasSize(1);
    }
}
