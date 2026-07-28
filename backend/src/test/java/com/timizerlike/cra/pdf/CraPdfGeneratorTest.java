package com.timizerlike.cra.pdf;

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
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class CraPdfGeneratorTest {

    private static final YearMonth PERIOD = YearMonth.of(2026, 3);
    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final CraPdfGenerator generator = new CraPdfGenerator();

    @Test
    void generatesTwoPagePdfWithSummaryAndDayDetails() throws IOException {
        CraPdfDocument document = fullFixture();

        byte[] bytes = generator.generate(document);

        assertThat(bytes).isNotEmpty();
        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isEqualTo(2);

            String page1 = extractPage(loaded, 1);
            assertThat(page1)
                    .contains("03/2026")
                    .contains("Alice Provider")
                    .contains("Provider SARL")
                    .contains("Acme Corp")
                    .contains("Corporate Client SA")
                    .contains("18.5")
                    .contains("Frais")
                    .contains("Signature prestataire")
                    .contains("01/04/2026")
                    .contains("Signature client");

            String page2 = extractPage(loaded, 2);
            for (CraPdfDayEntry entry : document.page2Days()) {
                assertThat(page2).contains(entry.date().format(DATE_FORMAT));
                if (entry.comment() != null) {
                    assertThat(page2).contains(entry.comment());
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
                new CraPdfProviderSignature("Alice Provider", LocalDate.of(2026, 4, 1), "sig-ref-123"),
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
                new CraPdfProviderSignature("Alice Provider", LocalDate.of(2026, 4, 1), null),
                null
        );
        CraPdfDocument document = new CraPdfDocument(summary, List.of(), signatures);

        byte[] bytes = generator.generate(document);

        assertThat(bytes).isNotEmpty();
        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isEqualTo(2);
            String page2 = extractPage(loaded, 2);
            assertThat(page2).contains("Date").contains("Valeur").contains("Note");
        }
    }

    @Test
    void displaysMonthPeriodAboveTable() throws IOException {
        byte[] bytes = generator.generate(fullFixture());

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            String page2 = extractPage(loaded, 2);
            assertThat(page2).contains("mars 2026");
        }
    }

    @Test
    void rendersAllDaysOf28DayMonth() throws IOException {
        YearMonth february = YearMonth.of(2026, 2);
        CraPdfDocument document = monthFixture(february, 11);

        byte[] bytes = generator.generate(document);

        try (PDDocument loaded = Loader.loadPDF(bytes)) {
            assertThat(loaded.getNumberOfPages()).isGreaterThanOrEqualTo(2);
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
            assertThat(loaded.getNumberOfPages()).isGreaterThanOrEqualTo(2);
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
            assertThat(loaded.getNumberOfPages()).isGreaterThanOrEqualTo(2);
            String allText = extractAllPages(loaded);
            for (int d = 1; d <= 31; d++) {
                assertThat(allText).contains(july.atDay(d).format(DATE_FORMAT));
            }
            assertThat(allText).contains("Total");
        }
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
                        LocalDate.of(2026, 4, 1),
                        "provider-signature-ref"
                ),
                null
        );
        return new CraPdfDocument(summary, days, signatures);
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
