package com.timizer.backend.cra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;

class CraDayEntryUpdateWorkValueTest {

    private static final LocalDate ANY_DATE = LocalDate.of(2026, 6, 15);

    private CraDayEntry entryWithValue(double initialValue) {
        return new CraDayEntry(1L, ANY_DATE, initialValue, null);
    }

    @Test
    void updatesToZero() {
        CraDayEntry entry = entryWithValue(1.0);
        entry.updateWorkValue(0.0);
        assertThat(entry.getWorkValue()).isEqualTo(0.0);
    }

    @Test
    void updatesToHalf() {
        CraDayEntry entry = entryWithValue(1.0);
        entry.updateWorkValue(0.5);
        assertThat(entry.getWorkValue()).isEqualTo(0.5);
    }

    @Test
    void updatesToFull() {
        CraDayEntry entry = entryWithValue(0.0);
        entry.updateWorkValue(1.0);
        assertThat(entry.getWorkValue()).isEqualTo(1.0);
    }

    @Test
    void rejectsDisallowedFractionalValue() {
        CraDayEntry entry = entryWithValue(1.0);
        assertThatThrownBy(() -> entry.updateWorkValue(0.25))
                .isInstanceOf(InvalidWorkValueException.class);
        assertThat(entry.getWorkValue()).isEqualTo(1.0);
    }

    @Test
    void rejectsValueAboveOne() {
        CraDayEntry entry = entryWithValue(0.5);
        assertThatThrownBy(() -> entry.updateWorkValue(2.0))
                .isInstanceOf(InvalidWorkValueException.class);
        assertThat(entry.getWorkValue()).isEqualTo(0.5);
    }

    @Test
    void rejectsNegativeValue() {
        CraDayEntry entry = entryWithValue(1.0);
        assertThatThrownBy(() -> entry.updateWorkValue(-1.0))
                .isInstanceOf(InvalidWorkValueException.class);
    }

    @Test
    void rejectsNaN() {
        CraDayEntry entry = entryWithValue(1.0);
        assertThatThrownBy(() -> entry.updateWorkValue(Double.NaN))
                .isInstanceOf(InvalidWorkValueException.class);
    }

    @Test
    void rejectsInfinity() {
        CraDayEntry entry = entryWithValue(1.0);
        assertThatThrownBy(() -> entry.updateWorkValue(Double.POSITIVE_INFINITY))
                .isInstanceOf(InvalidWorkValueException.class);
    }

    @Test
    void workValueUnchangedOnRejection() {
        CraDayEntry entry = entryWithValue(0.5);
        try {
            entry.updateWorkValue(0.75);
        } catch (InvalidWorkValueException ignored) {
        }
        assertThat(entry.getWorkValue()).isEqualTo(0.5);
    }
}
