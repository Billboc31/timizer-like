# Conflict Context — T025

Generated at: 2026-07-20T07:38:40Z

## Metadata

- pre_conflict_state: TEST_COMPLETE
- conflict_detected_at: 2026-07-20T07:38:21Z
- conflict_pr_number: 56
- conflicted_files (source): backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java
- skipped_runtime_noise: 0 path(s)

---

## Ticket branch diff since merge-base (81cf4b71)

(no source paths — only runtime/noise diffs against main)

---

## Conflicted Files

### backend/src/main/java/com/timizerlike/cra/pdf/CraPdfGenerator.java

```
package com.timizerlike.cra.pdf;

<<<<<<< HEAD
import org.springframework.stereotype.Component;

=======
>>>>>>> 3cd8bb8 (T016 — Create CRA PDF generator (#43))
import com.timizerlike.cra.pdf.model.CraPdfContact;
import com.timizerlike.cra.pdf.model.CraPdfDayEntry;
import com.timizerlike.cra.pdf.model.CraPdfDayType;
import com.timizerlike.cra.pdf.model.CraPdfDocument;
import com.timizerlike.cra.pdf.model.CraPdfParty;
import com.timizerlike.cra.pdf.model.CraPdfProviderSignature;
import com.timizerlike.cra.pdf.model.CraPdfSignatures;
import com.timizerlike.cra.pdf.model.CraPdfSummary;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

<<<<<<< HEAD
@Component
=======
>>>>>>> 3cd8bb8 (T016 — Create CRA PDF generator (#43))
public class CraPdfGenerator {

    private static final float MARGIN = 40f;
    private static final float PAGE_TOP = PDRectangle.A4.getHeight() - MARGIN;
    private static final float SIGNATURE_BOX_WIDTH = 120f;
    private static final float SIGNATURE_BOX_HEIGHT = 60f;

    private static final float PAGE2_ROW_HEIGHT = 18f;
    private static final float PAGE2_COL_JOUR_X = MARGIN;
    private static final float PAGE2_COL_VALEUR_X = MARGIN + 115f;
    private static final float PAGE2_COL_NOTE_X = MARGIN + 270f;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter PERIOD_FORMAT = DateTimeFormatter.ofPattern("MM/yyyy");

    private static final Map<DayOfWeek, String> SHORT_DAY_LABELS = Map.of(
            DayOfWeek.MONDAY, "Lun",
            DayOfWeek.TUESDAY, "Mar",
            DayOfWeek.WEDNESDAY, "Mer",
            DayOfWeek.THURSDAY, "Jeu",
            DayOfWeek.FRIDAY, "Ven",
            DayOfWeek.SATURDAY, "Sam",
            DayOfWeek.SUNDAY, "Dim"
    );

    private static final Map<CraPdfDayType, String> DAY_TYPE_LABELS = Map.of(
            CraPdfDayType.WORKED_FULL, "Travaillé",
            CraPdfDayType.WORKED_HALF, "Demi-journée",
            CraPdfDayType.WEEKEND, "Week-end",
            CraPdfDayType.HOLIDAY, "Férié",
            CraPdfDayType.NOT_WORKED, "Non travaillé"
    );

    private final PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private final PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);

    public byte[] generate(CraPdfDocument document) {
        try (PDDocument pdf = new PDDocument();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            renderPage1(pdf, document);
            renderPage2(pdf, document);
            pdf.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to generate CRA PDF", e);
        }
    }

    private void renderPage1(PDDocument pdf, CraPdfDocument document) throws IOException {
        PDPage page = new PDPage(PDRectangle.A4);
        pdf.addPage(page);
        try (PDPageContentStream cs = new PDPageContentStream(pdf, page)) {
            float y = PAGE_TOP;

            CraPdfSummary summary = document.page1();
            drawText(cs, bold, 16f, MARGIN, y, "Compte-Rendu d'Activité");
            y -= 22f;
            drawText(cs, regular, 12f, MARGIN, y, "Période : " + formatPeriod(summary.period()));
            y -= 30f;

            y = drawPartyBlock(cs, y, "Prestataire", summary.provider());
            y -= 15f;
            y = drawPartyBlock(cs, y, "Client", summary.client());
            y -= 15f;

            drawText(cs, bold, 12f, MARGIN, y, "Total jours travaillés");
            y -= 15f;
            drawText(cs, regular, 11f, MARGIN, y, formatFraction(summary.totalWorkedDays()));
            y -= 25f;

            drawText(cs, bold, 12f, MARGIN, y, "Frais");
            y -= 15f;
            drawText(cs, regular, 11f, MARGIN, y, "Frais : -");
            y -= 25f;

            y = drawProviderSignatureBlock(cs, y, document.signatures());
            y -= 15f;
            drawClientSignatureBlock(cs, y);
        }
    }

    private float drawPartyBlock(PDPageContentStream cs, float startY, String label, CraPdfParty party) throws IOException {
        float y = startY;
        drawText(cs, bold, 12f, MARGIN, y, label);
        y -= 15f;
        if (party == null) {
            return y;
        }
        y = drawOptionalLine(cs, y, party.name());
        y = drawOptionalLine(cs, y, party.company());
        y = drawOptionalLine(cs, y, party.address());
        CraPdfContact contact = party.contact();
        if (contact != null) {
            y = drawOptionalLine(cs, y, contact.name());
            y = drawOptionalLine(cs, y, contact.email());
        }
        return y;
    }

    private float drawOptionalLine(PDPageContentStream cs, float y, String value) throws IOException {
        if (value == null || value.isEmpty()) {
            return y;
        }
        drawText(cs, regular, 11f, MARGIN, y, value);
        return y - 14f;
    }

    private float drawProviderSignatureBlock(PDPageContentStream cs, float startY, CraPdfSignatures signatures) throws IOException {
        float y = startY;
        drawText(cs, bold, 12f, MARGIN, y, "Signature prestataire");
        y -= 15f;
        CraPdfProviderSignature provider = signatures == null ? null : signatures.provider();
        if (provider != null) {
            y = drawOptionalLine(cs, y, provider.name());
            if (provider.signedAt() != null) {
                drawText(cs, regular, 11f, MARGIN, y, "Signé le " + provider.signedAt().format(DATE_FORMAT));
                y -= 14f;
            }
            if (provider.signatureImageRef() != null) {
                float boxTop = y - 5f;
                float boxBottom = boxTop - SIGNATURE_BOX_HEIGHT;
                drawRectangle(cs, MARGIN, boxBottom, SIGNATURE_BOX_WIDTH, SIGNATURE_BOX_HEIGHT);
                drawText(cs, regular, 9f, MARGIN + 4f, boxTop - 15f, provider.signatureImageRef());
                y = boxBottom - 5f;
            }
        }
        return y;
    }

    private void drawClientSignatureBlock(PDPageContentStream cs, float startY) throws IOException {
        float y = startY;
        drawText(cs, bold, 12f, MARGIN, y, "Signature client");
        y -= 10f;
        float boxTop = y - 5f;
        float boxBottom = boxTop - SIGNATURE_BOX_HEIGHT;
        drawRectangle(cs, MARGIN, boxBottom, SIGNATURE_BOX_WIDTH, SIGNATURE_BOX_HEIGHT);
    }

    private void renderPage2(PDDocument pdf, CraPdfDocument document) throws IOException {
        PDPage page = new PDPage(PDRectangle.A4);
        pdf.addPage(page);
        try (PDPageContentStream cs = new PDPageContentStream(pdf, page)) {
            float y = PAGE_TOP;
            drawText(cs, bold, 14f, MARGIN, y, "Détail journalier");
            y -= 25f;

            drawText(cs, bold, 11f, PAGE2_COL_JOUR_X, y, "Jour");
            drawText(cs, bold, 11f, PAGE2_COL_VALEUR_X, y, "Valeur");
            drawText(cs, bold, 11f, PAGE2_COL_NOTE_X, y, "Note");
            y -= PAGE2_ROW_HEIGHT;

            List<CraPdfDayEntry> days = document.page2Days();
            if (days == null) {
                return;
            }
            for (CraPdfDayEntry entry : days) {
                drawText(cs, regular, 10f, PAGE2_COL_JOUR_X, y, formatDay(entry.date(), entry.dayOfWeek()));
                drawText(cs, regular, 10f, PAGE2_COL_VALEUR_X, y,
                        formatFraction(entry.workedFraction()) + " " + formatDayType(entry.type()));
                if (entry.comment() != null && !entry.comment().isEmpty()) {
                    drawText(cs, regular, 10f, PAGE2_COL_NOTE_X, y, entry.comment());
                }
                y -= PAGE2_ROW_HEIGHT;
            }
        }
    }

    private void drawText(PDPageContentStream cs, PDType1Font font, float size, float x, float y, String text) throws IOException {
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
    }

    private void drawRectangle(PDPageContentStream cs, float x, float y, float width, float height) throws IOException {
        cs.addRect(x, y, width, height);
        cs.stroke();
    }

    private String formatPeriod(YearMonth period) {
        return period.format(PERIOD_FORMAT);
    }

    private String formatDay(LocalDate date, DayOfWeek dayOfWeek) {
        String label = dayOfWeek == null ? "" : SHORT_DAY_LABELS.getOrDefault(dayOfWeek, "");
        String formattedDate = date == null ? "" : date.format(DATE_FORMAT);
        return (label + " " + formattedDate).trim();
    }

    private String formatFraction(BigDecimal value) {
        if (value == null) {
            return "0";
        }
        return value.toPlainString();
    }

    private String formatDayType(CraPdfDayType type) {
        return type == null ? "" : DAY_TYPE_LABELS.getOrDefault(type, type.name());
    }
}
```