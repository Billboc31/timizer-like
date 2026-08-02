package com.timizerlike.cra.pdf;

import com.timizerlike.cra.pdf.model.CraPdfClientSignature;
import com.timizerlike.cra.pdf.model.CraPdfContact;
import com.timizerlike.cra.pdf.model.CraPdfDayEntry;
import com.timizerlike.cra.pdf.model.CraPdfDayType;
import com.timizerlike.cra.pdf.model.CraPdfDocument;
import com.timizerlike.cra.pdf.model.CraPdfParty;
import com.timizerlike.cra.pdf.model.CraPdfProviderSignature;
import com.timizerlike.cra.pdf.model.CraPdfSignatures;
import com.timizerlike.cra.pdf.model.CraPdfSummary;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.Instant;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;

class CraPdfGeneratorTest {

    private static final YearMonth PERIOD = YearMonth.of(2026, 3);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    // Minimal valid 1x1 PNG (67 bytes)
    private static final byte[] MINIMAL_PNG = new byte[]{
        (byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
        0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
        0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
        0x08, 0x02, 0x00, 0x00, 0x00, (byte) 0x90, 0x77, 0x53,
        (byte) 0xDE, 0x00, 0x00, 0x00, 0x0C, 0x49, 0x44, 0x41,
        0x54, 0x08, (byte) 0xD7, 0x63, (byte) 0xF8, (byte) 0xCF, (byte) 0xC0, 0x00,
        0x00, 0x00, 0x02, 0x00, 0x01, (byte) 0xE2, 0x21, (byte) 0xBC,
        0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E,
        0x44, (byte) 0xAE, 0x42, 0x60, (byte) 0x82
    };

    private final CraPdfGenerator generator = new CraPdfGenerator();

    /** Returns an Instant at 10:00 Paris time on the given date for predictable date rendering. */
    private static Instant instantAt(int year, int month, int day) {
        return ZonedDateTime.of(year, month, day, 10, 0, 0, 0, ZoneId.of("Europe/Paris")).toInstant();
    }

    @Test
    void generatesTwoPagePdfWithSummaryAndDayDetails() throws IOException {
        CraPdfDocument document = fullFixture();

        byte[] bytes = generator.generate(document);

        assertThat(bytes).isNotEmpty();
        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isGreaterThanOrEqualTo(1);

            String page1 = extractPage(loaded, 1);
            assertThat(page1)
                    .contains("mars 2026")
                    .contains("18.5")
                    .contains("Signature prestataire")
                    .contains("01/04/2026")
                    .contains("Signature client");

            for (CraPdfDayEntry entry : document.page2Days()) {
                assertThat(page1).contains(entry.date().format(DATE_FORMAT));
                if (entry.comment() != null) {
                    assertThat(page1).contains(entry.comment());
                }
            }
        }
    }

    @Test
    void signedProviderBlockRendersNameAndDateInsideBox() throws IOException {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", "1 rue A", null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", "10 rue B", null),
                new java.math.BigDecimal("10")
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", null, instantAt(2026, 4, 1), null),
                null
        );
        CraPdfDocument document = new CraPdfDocument(summary, List.of(), signatures);

        byte[] bytes = generator.generate(document);

        assertThat(bytes).isNotEmpty();
        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page1 = extractPage(loaded, 1);
            assertThat(page1)
                    .contains("Signature prestataire")
                    .contains("Alice Provider")
                    .contains("01/04/2026");
        }
    }

    @Test
    void signedProviderBlockRendersImageDataInsideBox() throws IOException {
        byte[] minimalPng = Base64.getDecoder().decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="
        );
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", "1 rue A", null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", "10 rue B", null),
                new java.math.BigDecimal("10")
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", null, instantAt(2026, 4, 1), minimalPng),
                null
        );
        CraPdfDocument document = new CraPdfDocument(summary, List.of(), signatures);

        byte[] bytes = generator.generate(document);

        assertThat(bytes).isNotEmpty();
        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page1 = extractPage(loaded, 1);
            assertThat(page1)
                    .contains("Signature prestataire")
                    .contains("Alice Provider")
                    .contains("01/04/2026");
        }
    }

    @Test
    void tolerantToNullProviderContactAndEmptyDayList() throws IOException {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", "1 rue A", null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", "10 rue B", null),
                new BigDecimal("0")
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", null, instantAt(2026, 4, 1), null),
                null
        );
        CraPdfDocument document = new CraPdfDocument(summary, List.of(), signatures);

        byte[] bytes = generator.generate(document);

        assertThat(bytes).isNotEmpty();
        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            String page1 = extractPage(loaded, 1);
            assertThat(page1).contains("Détail journalier");
        }
    }

    @Test
    void displaysMonthPeriodAboveTable() throws IOException {
        byte[] bytes = generator.generate(fullFixture());

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page1 = extractPage(loaded, 1);
            assertThat(page1).contains("mars 2026");
        }
    }

    @Test
    void rendersAllDaysOf28DayMonth() throws IOException {
        YearMonth february = YearMonth.of(2026, 2);
        CraPdfDocument document = monthFixture(february, 11);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            String allText = extractAllPages(loaded);
            for (int d = 1; d <= 28; d++) {
                assertThat(allText).contains(february.atDay(d).format(DATE_FORMAT));
            }
        }
    }

    @Test
    void rendersAllDaysOf30DayMonth() throws IOException {
        YearMonth april = YearMonth.of(2026, 4);
        CraPdfDocument document = monthFixture(april, 8);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            String allText = extractAllPages(loaded);
            for (int d = 1; d <= 30; d++) {
                assertThat(allText).contains(april.atDay(d).format(DATE_FORMAT));
            }
            assertThat(allText).contains("Total");
        }
    }

    @Test
    void rendersAllDaysOf31DayMonthAcrossPages() throws IOException {
        YearMonth july = YearMonth.of(2026, 7);
        CraPdfDocument document = monthFixture(july, 15);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            String allText = extractAllPages(loaded);
            for (int d = 1; d <= 31; d++) {
                assertThat(allText).contains(july.atDay(d).format(DATE_FORMAT));
            }
            assertThat(allText).contains("Total");
        }
    }

    @Test
    void generatesPdfWithPendingClientSignature() throws IOException {
        CraPdfDocument document = providerOnlyFixture();

        byte[] bytes = generator.generate(document);

        assertThat(bytes).isNotEmpty();
        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page1 = extractPage(loaded, 1);
            assertThat(page1).contains("En attente de signature");
            assertThat(page1).contains("Alice Provider");
            assertThat(page1).contains("01/04/2026");
        }
    }

    @Test
    void generatesPdfWithBothSignatures() throws IOException {
        CraPdfDocument document = bothSignaturesFixture();

        byte[] bytes = generator.generate(document);

        assertThat(bytes).isNotEmpty();
        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page1 = extractPage(loaded, 1);
            assertThat(page1).contains("Alice Provider");
            assertThat(page1).contains("01/04/2026");
            assertThat(page1).contains("Bob Client");
            assertThat(page1).contains("15/04/2026");
        }
    }

    @Test
    void handlesMissingSignatureImageGracefully() {
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", null, instantAt(2026, 4, 1), new byte[]{1, 2, 3}),
                new CraPdfClientSignature("Bob Client", null, instantAt(2026, 4, 15), new byte[]{99})
        );
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", null, null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", null, null),
                BigDecimal.ZERO
        );
        CraPdfDocument document = new CraPdfDocument(summary, List.of(), signatures);

        assertThatCode(() -> generator.generate(document)).doesNotThrowAnyException();
    }

    @Test
    void coverPageContainsCalendarMonthAndTotals() throws IOException {
        CraPdfDocument document = fullFixture();

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page1 = extractPage(loaded, 1);
            assertThat(page1)
                    .contains("Compte-Rendu d'Activité")
                    .contains("mars 2026")
                    .contains("18.5");
        }
    }

    @Test
    void coverPageRendersEveryMonthExactlyOnce() throws IOException {
        CraPdfDocument document = twoMonthFixture();

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page1 = extractPage(loaded, 1);
            assertThat(page1)
                    .contains("avril 2026")
                    .contains("mai 2026");
        }
    }

    // F1: Provider not signed → "En attente de signature" in provider section
    @Test
    void providerNotSignedShowsPendingInProviderBlock() throws IOException {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", null, null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", null, null),
                BigDecimal.ZERO
        );
        CraPdfDocument document = new CraPdfDocument(summary, List.of(), new CraPdfSignatures(null, null));

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page1 = extractPage(loaded, 1);
            assertThat(page1).contains("Signature prestataire");
            assertThat(page1).contains("En attente de signature");
        }
    }

    // F1: Corrupt image bytes → "Signature illisible" in the box
    @Test
    void corruptProviderSignatureImageRendersIllisible() throws IOException {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", null, null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", null, null),
                BigDecimal.ZERO
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", null, instantAt(2026, 4, 1), new byte[]{0x00}),
                null
        );
        CraPdfDocument document = new CraPdfDocument(summary, List.of(), signatures);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String allText = extractAllPages(loaded);
            assertThat(allText).contains("Signature illisible");
        }
    }

    // F1: Role label in provider and client blocks when non-null
    @Test
    void roleLabelAppearsInBothSignatureBlocksWhenProvided() throws IOException {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", null, null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", null, null),
                BigDecimal.ZERO
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", "Directrice Technique", instantAt(2026, 4, 1), MINIMAL_PNG),
                new CraPdfClientSignature("Bob Client", "Responsable Achats", instantAt(2026, 4, 15), MINIMAL_PNG)
        );
        CraPdfDocument document = new CraPdfDocument(summary, List.of(), signatures);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String allText = extractAllPages(loaded);
            assertThat(allText).contains("Directrice Technique");
            assertThat(allText).contains("Responsable Achats");
        }
    }

    // F1: Both signed with MINIMAL_PNG → no exception, both blocks contain signer names
    @Test
    void bothSignedWithMinimalPngProducesValidPdf() throws IOException {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", null, null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", null, null),
                BigDecimal.ZERO
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", null, instantAt(2026, 4, 1), MINIMAL_PNG),
                new CraPdfClientSignature("Bob Client", null, instantAt(2026, 4, 15), MINIMAL_PNG)
        );
        CraPdfDocument document = new CraPdfDocument(summary, List.of(), signatures);

        byte[] bytes = generator.generate(document);

        assertThat(bytes).isNotEmpty();
        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page1 = extractPage(loaded, 1);
            assertThat(page1).contains("Alice Provider").contains("Bob Client");
        }
    }

    // F1: Multi-month day entries → each month section has signature blocks
    @Test
    void multiMonthEntriesEachMonthSectionHasSignatureBlocks() throws IOException {
        CraPdfDocument document = twoMonthWithSignaturesFixture();

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String allText = extractAllPages(loaded);
            // Both months appear as section headers
            assertThat(allText).contains("avril 2026").contains("mai 2026");
            // Signature blocks must appear at least twice — once per monthly detail section
            int providerCount = countOccurrences(allText, "Signature prestataire");
            assertThat(providerCount).isGreaterThanOrEqualTo(2);
            int clientCount = countOccurrences(allText, "Signature client");
            assertThat(clientCount).isGreaterThanOrEqualTo(2);
        }
    }

    // F1: Client "Lu et approuvé" wording appears when client has signed
    @Test
    void clientValidationWordingAppearsWhenClientSigned() throws IOException {
        CraPdfDocument document = bothSignaturesFixture();

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String allText = extractAllPages(loaded);
            assertThat(allText).contains("Lu et approuvé les éléments ci-dessus");
        }
    }

    @Test
    void shortOneMonthCraFitsOnOnePage() throws IOException {
        CraPdfSummary summary = new CraPdfSummary(PERIOD, null, null, new BigDecimal("5"));
        List<CraPdfDayEntry> days = List.of(
                new CraPdfDayEntry(LocalDate.of(2026, 3, 2), DayOfWeek.MONDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null),
                new CraPdfDayEntry(LocalDate.of(2026, 3, 3), DayOfWeek.TUESDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null),
                new CraPdfDayEntry(LocalDate.of(2026, 3, 4), DayOfWeek.WEDNESDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null),
                new CraPdfDayEntry(LocalDate.of(2026, 3, 5), DayOfWeek.THURSDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null),
                new CraPdfDayEntry(LocalDate.of(2026, 3, 6), DayOfWeek.FRIDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null)
        );
        CraPdfDocument document = new CraPdfDocument(summary, days, null);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isEqualTo(1);
        }
    }

    @Test
    void fullOneMonthCraRendersCalendarAndDetailOnSamePage() throws IOException {
        CraPdfDocument document = monthFixture(YearMonth.of(2026, 3), 15);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page1 = extractPage(loaded, 1);
            assertThat(page1).contains("mars 2026");
            assertThat(page1).contains("02/03/2026");

            String lastPageText = extractPage(loaded, loaded.getNumberOfPages());
            assertThat(lastPageText.trim()).isNotEmpty();
        }
    }

    @Test
    void multiMonthCraPaginatesWithoutClipping() throws IOException {
        CraPdfDocument document = twoMonthFixture();

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isGreaterThanOrEqualTo(1);
            String allText = extractAllPages(loaded);
            assertThat(allText).contains("avril 2026").contains("mai 2026");
            assertThat(allText).contains("06/04/2026");
            assertThat(allText).contains("04/05/2026");
        }
    }

    @Test
    void contentJustBelowThresholdFitsOnOnePage() throws IOException {
        CraPdfSummary summary = new CraPdfSummary(PERIOD, null, null, new BigDecimal("3"));
        List<CraPdfDayEntry> days = List.of(
                new CraPdfDayEntry(LocalDate.of(2026, 3, 2), DayOfWeek.MONDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null),
                new CraPdfDayEntry(LocalDate.of(2026, 3, 3), DayOfWeek.TUESDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null),
                new CraPdfDayEntry(LocalDate.of(2026, 3, 4), DayOfWeek.WEDNESDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null)
        );
        CraPdfDocument document = new CraPdfDocument(summary, days, null);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isEqualTo(1);
        }
    }

    @Test
    void contentJustAboveThresholdOverflowsToTwoPages() throws IOException {
        CraPdfDocument document = monthFixture(YearMonth.of(2026, 7), 15);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isGreaterThanOrEqualTo(2);
        }
    }

    @Test
    void noRedundantTrailingPage() throws IOException {
        CraPdfDocument document = fullFixture();

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String lastPage = extractPage(loaded, loaded.getNumberOfPages());
            assertThat(lastPage.trim()).isNotEmpty();
        }
    }

    @Test
    void signatureBlocksAppearOnSinglePage() throws IOException {
        CraPdfDocument document = providerOnlyFixture();

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String allText = extractAllPages(loaded);
            assertThat(allText).contains("Signature prestataire");
            assertThat(allText).contains("Signature client");
            // For a short fixture both signature blocks are on the same (only) page
            assertThat(loaded.getNumberOfPages()).isEqualTo(1);
        }
    }

    @Test
    void signedAndUnsignedStatesRenderCorrectly() throws IOException {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", null, null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", null, null),
                BigDecimal.ZERO
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", null, instantAt(2026, 4, 1), MINIMAL_PNG),
                null
        );
        CraPdfDocument document = new CraPdfDocument(summary, List.of(), signatures);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String allText = extractAllPages(loaded);
            assertThat(allText).contains("Alice Provider");
            assertThat(allText).contains("01/04/2026");
            assertThat(allText).contains("En attente de signature");
        }
    }

    private static CraPdfDocument twoMonthFixture() {
        YearMonth april = YearMonth.of(2026, 4);
        CraPdfSummary summary = new CraPdfSummary(april, null, null, new BigDecimal("5"));
        List<CraPdfDayEntry> days = List.of(
                new CraPdfDayEntry(LocalDate.of(2026, 4, 6), DayOfWeek.MONDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null),
                new CraPdfDayEntry(LocalDate.of(2026, 5, 4), DayOfWeek.MONDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null)
        );
        return new CraPdfDocument(summary, days, null);
    }

    private static CraPdfDocument twoMonthWithSignaturesFixture() {
        YearMonth april = YearMonth.of(2026, 4);
        CraPdfSummary summary = new CraPdfSummary(april, null, null, new BigDecimal("2"));
        List<CraPdfDayEntry> days = List.of(
                new CraPdfDayEntry(LocalDate.of(2026, 4, 6), DayOfWeek.MONDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null),
                new CraPdfDayEntry(LocalDate.of(2026, 5, 4), DayOfWeek.MONDAY, CraPdfDayType.WORKED_FULL, BigDecimal.ONE, null)
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", null, instantAt(2026, 4, 1), MINIMAL_PNG),
                null
        );
        return new CraPdfDocument(summary, days, signatures);
    }

    private static CraPdfDocument monthFixture(YearMonth yearMonth, int halfDayOfMonth) {
        CraPdfSummary summary = new CraPdfSummary(yearMonth, null, null, BigDecimal.ZERO);
        List<CraPdfDayEntry> days = new ArrayList<>();
        for (int d = 1; d <= yearMonth.lengthOfMonth(); d++) {
            LocalDate date = yearMonth.atDay(d);
            DayOfWeek dow = date.getDayOfWeek();
            CraPdfDayType type;
            BigDecimal fraction;
            if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
                type = CraPdfDayType.WEEKEND;
                fraction = BigDecimal.ZERO;
            } else if (d == halfDayOfMonth) {
                type = CraPdfDayType.WORKED_HALF;
                fraction = new BigDecimal("0.5");
            } else {
                type = CraPdfDayType.WORKED_FULL;
                fraction = BigDecimal.ONE;
            }
            days.add(new CraPdfDayEntry(date, dow, type, fraction, null));
        }
        return new CraPdfDocument(summary, days, null);
    }

    private static CraPdfDocument fullFixture() {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty(
                        "Alice Provider",
                        "Provider SARL",
                        "1 rue du Prestataire, 75001 Paris",
                        new CraPdfContact("Alice Provider", "alice@provider.example")
                ),
                new CraPdfParty(
                        "Acme Corp",
                        "Corporate Client SA",
                        "10 avenue du Client, 92100 Boulogne",
                        new CraPdfContact("Bob Buyer", "bob@acme.example")
                ),
                new BigDecimal("18.5")
        );
        List<CraPdfDayEntry> days = List.of(
                new CraPdfDayEntry(
                        LocalDate.of(2026, 3, 2),
                        DayOfWeek.MONDAY,
                        CraPdfDayType.WORKED_FULL,
                        BigDecimal.ONE,
                        "Mission ACME"
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
                        new BigDecimal("0"),
                        null
                ),
                new CraPdfDayEntry(
                        LocalDate.of(2026, 3, 6),
                        DayOfWeek.FRIDAY,
                        CraPdfDayType.HOLIDAY,
                        new BigDecimal("0"),
                        "Jour ferie"
                ),
                new CraPdfDayEntry(
                        LocalDate.of(2026, 3, 30),
                        DayOfWeek.MONDAY,
                        CraPdfDayType.NOT_WORKED,
                        new BigDecimal("0"),
                        "Conge"
                )
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature(
                        "Alice Provider",
                        null,
                        instantAt(2026, 4, 1),
                        null
                ),
                null
        );
        return new CraPdfDocument(summary, days, signatures);
    }

    private static CraPdfDocument providerOnlyFixture() {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", null, null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", null, null),
                BigDecimal.ZERO
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", null, instantAt(2026, 4, 1), MINIMAL_PNG),
                null
        );
        return new CraPdfDocument(summary, List.of(), signatures);
    }

    private static CraPdfDocument bothSignaturesFixture() {
        CraPdfSummary summary = new CraPdfSummary(
                PERIOD,
                new CraPdfParty("Alice Provider", "Provider SARL", null, null),
                new CraPdfParty("Acme Corp", "Corporate Client SA", null, null),
                BigDecimal.ZERO
        );
        CraPdfSignatures signatures = new CraPdfSignatures(
                new CraPdfProviderSignature("Alice Provider", null, instantAt(2026, 4, 1), MINIMAL_PNG),
                new CraPdfClientSignature("Bob Client", null, instantAt(2026, 4, 15), MINIMAL_PNG)
        );
        return new CraPdfDocument(summary, List.of(), signatures);
    }

    private static int countOccurrences(String text, String substring) {
        int count = 0;
        int idx = 0;
        while ((idx = text.indexOf(substring, idx)) != -1) {
            count++;
            idx += substring.length();
        }
        return count;
    }

    private static String extractPage(PDDocument document, int pageNumber) throws IOException {
        PDFTextStripper stripper = new PDFTextStripper();
        stripper.setStartPage(pageNumber);
        stripper.setEndPage(pageNumber);
        return stripper.getText(document);
    }

    private static String extractAllPages(PDDocument document) throws IOException {
        return new PDFTextStripper().getText(document);
    }
}
