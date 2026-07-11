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
            assertThat(page2).contains("Jour").contains("Valeur").contains("Note");
        }
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
}
