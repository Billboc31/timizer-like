package com.timizer.backend.cra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.hibernate.exception.ConstraintViolationException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.test.context.TestPropertySource;

@DataJpaTest
@TestPropertySource(properties = {
    "spring.jpa.hibernate.ddl-auto=create-drop"
})
class MonthlyCraReportPersistenceTest {

    @Autowired
    private TestEntityManager entityManager;

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

    @Test
    void persistingValidReportAssignsIdAndTimestamps() {
        MonthlyCraReport report = newReport(6, 2026);

        entityManager.persistAndFlush(report);

        assertThat(report.getId()).isNotNull();
        assertThat(report.getCreatedAt()).isNotNull();
        assertThat(report.getUpdatedAt()).isNotNull();
        assertThat(report.getStatus()).isEqualTo(ValidationStatus.DRAFT);
    }

    @Test
    void duplicateMonthAndYearIsRejected() {
        entityManager.persistAndFlush(newReport(6, 2026));

        MonthlyCraReport duplicate = newReport(6, 2026);

        assertThatThrownBy(() -> entityManager.persistAndFlush(duplicate))
            .isInstanceOfAny(DataIntegrityViolationException.class, ConstraintViolationException.class);
    }

    @Test
    void sameMonthDifferentYearIsAllowed() {
        entityManager.persistAndFlush(newReport(6, 2026));
        entityManager.persistAndFlush(newReport(6, 2027));
    }
}
