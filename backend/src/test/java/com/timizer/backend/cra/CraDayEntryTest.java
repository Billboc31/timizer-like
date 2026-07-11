package com.timizer.backend.cra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;
import java.util.Set;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import org.junit.jupiter.api.Test;

class CraDayEntryTest {

    private static final Long MONTHLY_CRA_ID = 42L;
    private static final LocalDate ANY_DATE = LocalDate.of(2026, 6, 15);

    @Test
    void constructsWithWorkValueZero() {
        CraDayEntry entry = new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, 0.0, "off day");

        assertThat(entry.getMonthlyCraId()).isEqualTo(MONTHLY_CRA_ID);
        assertThat(entry.getDate()).isEqualTo(ANY_DATE);
        assertThat(entry.getWorkValue()).isEqualTo(0.0);
        assertThat(entry.getNote()).isEqualTo("off day");
        assertThat(entry.getId()).isNull();
    }

    @Test
    void constructsWithWorkValueHalf() {
        CraDayEntry entry = new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, 0.5, null);

        assertThat(entry.getWorkValue()).isEqualTo(0.5);
    }

    @Test
    void constructsWithWorkValueFull() {
        CraDayEntry entry = new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, 1.0, null);

        assertThat(entry.getWorkValue()).isEqualTo(1.0);
    }

    @Test
    void rejectsDisallowedFractionalWorkValue() {
        assertThatThrownBy(() -> new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, 0.25, null))
            .isInstanceOf(InvalidWorkValueException.class);
    }

    @Test
    void rejectsWorkValueAboveOne() {
        assertThatThrownBy(() -> new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, 2.0, null))
            .isInstanceOf(InvalidWorkValueException.class);
    }

    @Test
    void rejectsNegativeWorkValue() {
        assertThatThrownBy(() -> new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, -1.0, null))
            .isInstanceOf(InvalidWorkValueException.class);
    }

    @Test
    void rejectsNaNWorkValue() {
        assertThatThrownBy(() -> new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, Double.NaN, null))
            .isInstanceOf(InvalidWorkValueException.class);
    }

    @Test
    void rejectsInfiniteWorkValue() {
        assertThatThrownBy(() -> new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, Double.POSITIVE_INFINITY, null))
            .isInstanceOf(InvalidWorkValueException.class);
    }

    @Test
    void invalidWorkValueExceptionCarriesRejectedValue() {
        InvalidWorkValueException exception = new InvalidWorkValueException(0.25);

        assertThat(exception.getWorkValue()).isEqualTo(0.25);
        assertThat(exception.getMessage()).contains("0.25");
    }

    @Test
    void acceptsNullNote() {
        CraDayEntry entry = new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, 1.0, null);

        assertThat(entry.getNote()).isNull();
    }

    @Test
    void acceptsEmptyNote() {
        CraDayEntry entry = new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, 1.0, "");

        assertThat(entry.getNote()).isEqualTo("");
    }

    @Test
    void preservesProvidedNoteVerbatim() {
        String note = "Worked on the CRA export feature.";

        CraDayEntry entry = new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, 1.0, note);

        assertThat(entry.getNote()).isEqualTo(note);
    }

    @Test
    void storesMonthlyCraIdLink() {
        CraDayEntry entry = new CraDayEntry(999L, ANY_DATE, 0.5, null);

        assertThat(entry.getMonthlyCraId()).isEqualTo(999L);
    }

    @Test
    void rejectsNullMonthlyCraId() {
        assertThatThrownBy(() -> new CraDayEntry(null, ANY_DATE, 1.0, null))
            .isInstanceOf(NullPointerException.class);
    }

    @Test
    void rejectsNullDate() {
        assertThatThrownBy(() -> new CraDayEntry(MONTHLY_CRA_ID, null, 1.0, null))
            .isInstanceOf(NullPointerException.class);
    }

    @Test
    void beanValidationAcceptsValidEntry() {
        CraDayEntry entry = new CraDayEntry(MONTHLY_CRA_ID, ANY_DATE, 1.0, "note");

        Set<ConstraintViolation<CraDayEntry>> violations = validate(entry);

        assertThat(violations).isEmpty();
    }

    private static Set<ConstraintViolation<CraDayEntry>> validate(CraDayEntry entry) {
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            Validator validator = factory.getValidator();
            return validator.validate(entry);
        }
    }
}
