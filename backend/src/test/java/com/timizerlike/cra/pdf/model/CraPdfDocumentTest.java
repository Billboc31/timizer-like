package com.timizerlike.cra.pdf.model;

import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CraPdfDocumentTest {

    private static final YearMonth PERIOD = YearMonth.of(2026, 3);

    private static CraPdfParty sampleProvider() {
        return new CraPdfParty(
                "Alice Provider",
                "Provider SARL",
                "1 rue du Prestataire, 75001 Paris",
                null
        );
    }

    private static CraPdfParty sampleClient() {
        return new CraPdfParty(
                "Acme Corp",
                null,
                "10 avenue du Client, 92100 Boulogne",
                new CraPdfContact("Bob Buyer", "bob@acme.example")
        );
    }

    private static List<CraPdfDayEntry> sampleDays() {
        return List.of(
                new CraPdfDayEntry(
                        LocalDate.of(2026, 3, 2),
                        DayOfWeek.MONDAY,
                        CraPdfDayType.WORKED_FULL,
                        BigDecimal.ONE,
                        null
                ),
                new CraPdfDayEntry(
                        LocalDate.of(2026, 3, 3),
                        DayOfWeek.TUESDAY,
                        CraPdfDayType.WORKED_HALF,
                        new BigDecimal("0.5"),
                        null
                ),
                new CraPdfDayEntry(
                        LocalDate.of(2026, 3, 7),
                        DayOfWeek.SATURDAY,
                        CraPdfDayType.WEEKEND,
                        BigDecimal.ZERO,
                        null
                )
        );
    }

    @Test
    void constructsValidDocumentFromFixtures() {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                sampleProvider(),
                sampleClient(),
                new BigDecimal("1.5")
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature(
                        "Alice Provider",
                        LocalDate.of(2026, 4, 1),
                        "provider-signature-ref"
                ),
                new CraPdfClientSignature(null, null, null)
        );

        CraPdfDocument document = new CraPdfDocument(summary, sampleDays(), signatures);

        assertThat(document.page1()).isSameAs(summary);
        assertThat(document.page2Days()).isSameAs(document.page2Days());
        assertThat(document.signatures()).isSameAs(signatures);
    }

    @Test
    void page1SummaryCarriesPeriodProviderClientAndTotal() {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                sampleProvider(),
                sampleClient(),
                new BigDecimal("1.5")
        );

        assertThat(summary.period()).isEqualTo(PERIOD);
        assertThat(summary.provider().name()).isEqualTo("Alice Provider");
        assertThat(summary.provider().company()).isEqualTo("Provider SARL");
        assertThat(summary.provider().address()).isEqualTo("1 rue du Prestataire, 75001 Paris");
        assertThat(summary.client().name()).isEqualTo("Acme Corp");
        assertThat(summary.client().address()).isEqualTo("10 avenue du Client, 92100 Boulogne");
        assertThat(summary.client().contact().name()).isEqualTo("Bob Buyer");
        assertThat(summary.client().contact().email()).isEqualTo("bob@acme.example");
        assertThat(summary.totalWorkedDays()).isEqualByComparingTo("1.5");
    }

    @Test
    void page2ExposesDayByDayEntriesWithDatesAndWorkedFractions() {
        List<CraPdfDayEntry> days = sampleDays();

        assertThat(days).hasSize(3);
        assertThat(days.get(0).date()).isEqualTo(LocalDate.of(2026, 3, 2));
        assertThat(days.get(0).dayOfWeek()).isEqualTo(DayOfWeek.MONDAY);
        assertThat(days.get(0).type()).isEqualTo(CraPdfDayType.WORKED_FULL);
        assertThat(days.get(0).workedFraction()).isEqualByComparingTo("1");
        assertThat(days.get(1).type()).isEqualTo(CraPdfDayType.WORKED_HALF);
        assertThat(days.get(1).workedFraction()).isEqualByComparingTo("0.5");
        assertThat(days.get(2).type()).isEqualTo(CraPdfDayType.WEEKEND);
        assertThat(days.get(2).workedFraction()).isEqualByComparingTo("0");
    }

    @Test
    void signaturesAcceptNullClientFieldsForEmptyBlock() {
        CraPdfClientSignature emptyClient = new CraPdfClientSignature(null, null, null);
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", LocalDate.of(2026, 4, 1), null),
                emptyClient
        );

        assertThat(signatures.client().clientRepresentativeName()).isNull();
        assertThat(signatures.client().signedAt()).isNull();
        assertThat(signatures.client().signatureImageRef()).isNull();
        assertThat(signatures.provider().name()).isEqualTo("Alice Provider");
        assertThat(signatures.provider().signedAt()).isEqualTo(LocalDate.of(2026, 4, 1));
        assertThat(signatures.provider().signatureImageRef()).isNull();
    }
}
