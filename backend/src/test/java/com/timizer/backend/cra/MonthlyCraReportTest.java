package com.timizer.backend.cra;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.Test;

class MonthlyCraReportTest {

    private static MonthlyCraReport validReport() {
        return new MonthlyCraReport(
            6,
            2026,
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
    void constructorPopulatesRequiredFieldsAndDefaultsToDraft() {
        MonthlyCraReport report = validReport();

        assertThat(report.getMonth()).isEqualTo(6);
        assertThat(report.getYear()).isEqualTo(2026);
        assertThat(report.getProviderFirstName()).isEqualTo("Alice");
        assertThat(report.getProviderLastName()).isEqualTo("Provider");
        assertThat(report.getProviderCompany()).isEqualTo("Provider Co.");
        assertThat(report.getClientFirstName()).isEqualTo("Bob");
        assertThat(report.getClientLastName()).isEqualTo("Client");
        assertThat(report.getClientCompany()).isEqualTo("Client Co.");
        assertThat(report.getClientContactEmail()).isEqualTo("bob.client@example.com");
        assertThat(report.getClientContactPhone()).isEqualTo("+33123456789");
        assertThat(report.getStatus()).isEqualTo(ValidationStatus.DRAFT);
        assertThat(report.getProviderSignatureDate()).isNull();
        assertThat(report.getId()).isNull();
    }

    @Test
    void prePersistSetsCreatedAtAndUpdatedAt() {
        MonthlyCraReport report = validReport();

        report.onPrePersist();

        assertThat(report.getCreatedAt()).isNotNull();
        assertThat(report.getUpdatedAt()).isNotNull();
        assertThat(report.getUpdatedAt()).isEqualTo(report.getCreatedAt());
    }

    @Test
    void preUpdateRefreshesOnlyUpdatedAt() throws InterruptedException {
        MonthlyCraReport report = validReport();
        report.onPrePersist();
        var originalCreatedAt = report.getCreatedAt();
        var originalUpdatedAt = report.getUpdatedAt();

        Thread.sleep(5);
        report.onPreUpdate();

        assertThat(report.getCreatedAt()).isEqualTo(originalCreatedAt);
        assertThat(report.getUpdatedAt()).isAfter(originalUpdatedAt);
    }

    @Test
    void beanValidationRejectsMonthBelowRange() {
        MonthlyCraReport report = new MonthlyCraReport(
            0, 2026,
            "Alice", "Provider", "Provider Co.",
            "Bob", "Client", "Client Co.",
            "bob.client@example.com", null
        );

        Set<ConstraintViolation<MonthlyCraReport>> violations = validate(report);

        assertThat(violations)
            .extracting(v -> v.getPropertyPath().toString())
            .contains("month");
    }

    @Test
    void beanValidationRejectsMonthAboveRange() {
        MonthlyCraReport report = new MonthlyCraReport(
            13, 2026,
            "Alice", "Provider", "Provider Co.",
            "Bob", "Client", "Client Co.",
            "bob.client@example.com", null
        );

        Set<ConstraintViolation<MonthlyCraReport>> violations = validate(report);

        assertThat(violations)
            .extracting(v -> v.getPropertyPath().toString())
            .contains("month");
    }

    @Test
    void beanValidationAcceptsValidReport() {
        Set<ConstraintViolation<MonthlyCraReport>> violations = validate(validReport());

        assertThat(violations).isEmpty();
    }

    private static Set<ConstraintViolation<MonthlyCraReport>> validate(MonthlyCraReport report) {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();
            return validator.validate(report);
        }
    }
}
