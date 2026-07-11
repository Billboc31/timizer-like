package com.timizerlike.backend.cra.dto;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertSame;

class CraDtoTest {

    @Test
    void craStatusExposesDraftAndValidated() {
        assertArrayEquals(
                new CraStatus[]{CraStatus.DRAFT, CraStatus.VALIDATED},
                CraStatus.values()
        );
    }

    @Test
    void craDayEntryDtoRoundTrip() {
        CraDayEntryDto entry = new CraDayEntryDto(15, 0.5, "test note");

        assertEquals(15, entry.day());
        assertEquals(0.5, entry.worked());
        assertEquals("test note", entry.note());
    }

    @Test
    void craSummaryDtoRoundTrip() {
        CraSummaryDto summary = new CraSummaryDto(42L, 3, 2026, 18.5, CraStatus.DRAFT);

        assertEquals(42L, summary.id());
        assertEquals(3, summary.month());
        assertEquals(2026, summary.year());
        assertEquals(18.5, summary.totalWorkedDays());
        assertEquals(CraStatus.DRAFT, summary.status());
    }

    @Test
    void craDetailsDtoRoundTrip() {
        List<CraDayEntryDto> days = List.of(
                new CraDayEntryDto(1, 1.0, null),
                new CraDayEntryDto(2, 0.5, null)
        );

        CraDetailsDto details = new CraDetailsDto(7L, 6, 2026, 1.5, CraStatus.VALIDATED, days);

        assertEquals(7L, details.id());
        assertEquals(6, details.month());
        assertEquals(2026, details.year());
        assertEquals(1.5, details.totalWorkedDays());
        assertEquals(CraStatus.VALIDATED, details.status());
        assertSame(days, details.days());
    }

    @Test
    void craCreateOrUpdateRequestDtoRoundTrip() {
        List<CraDayEntryDto> days = List.of(new CraDayEntryDto(10, 1.0, null));

        CraCreateOrUpdateRequestDto request = new CraCreateOrUpdateRequestDto(11, 2026, days);

        assertEquals(11, request.month());
        assertEquals(2026, request.year());
        assertSame(days, request.days());
    }
}
