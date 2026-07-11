package com.timizer.backend.cra;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.Test;

class CraTotalCalculationServiceTest {

    private final CraTotalCalculationService service = new CraTotalCalculationService();

    @Test
    void returnsZeroForEmptyCollection() {
        assertEquals(0.0, service.calculateTotalWorkedDays(Collections.emptyList()));
    }

    @Test
    void sumsFullDaysOnly() {
        List<CraDayEntry> entries = buildEntries(new double[] {1.0, 1.0, 1.0, 1.0, 1.0});
        assertEquals(5.0, service.calculateTotalWorkedDays(entries));
    }

    @Test
    void sumsHalfDaysOnly() {
        List<CraDayEntry> entries = buildEntries(new double[] {0.5, 0.5, 0.5});
        assertEquals(1.5, service.calculateTotalWorkedDays(entries));
    }

    @Test
    void ignoresNonWorkedDays() {
        List<CraDayEntry> entries = buildEntries(new double[] {0.0, 0.0, 0.0, 0.0, 0.0, 1.0, 1.0});
        assertEquals(2.0, service.calculateTotalWorkedDays(entries));
    }

    @Test
    void matchesAcceptanceExample() {
        double[] values = new double[22];
        for (int i = 0; i < 21; i++) {
            values[i] = 1.0;
        }
        values[21] = 0.5;
        List<CraDayEntry> entries = buildEntries(values);
        assertEquals(21.5, service.calculateTotalWorkedDays(entries));
    }

    @Test
    void rejectsNullCollection() {
        assertThrows(NullPointerException.class, () -> service.calculateTotalWorkedDays(null));
    }

    @Test
    void rejectsNullEntryInCollection() {
        List<CraDayEntry> entries = new ArrayList<>();
        entries.add(new CraDayEntry(1L, LocalDate.of(2026, 1, 1), 1.0, null));
        entries.add(null);
        assertThrows(IllegalArgumentException.class, () -> service.calculateTotalWorkedDays(entries));
    }

    private static List<CraDayEntry> buildEntries(double[] workValues) {
        List<CraDayEntry> entries = new ArrayList<>(workValues.length);
        LocalDate date = LocalDate.of(2026, 1, 1);
        for (double value : workValues) {
            entries.add(new CraDayEntry(1L, date, value, null));
            date = date.plusDays(1);
        }
        return entries;
    }
}
