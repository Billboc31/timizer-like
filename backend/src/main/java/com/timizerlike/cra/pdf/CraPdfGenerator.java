package com.timizerlike.cra.pdf;

import org.springframework.stereotype.Component;

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

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Component
public class CraPdfGenerator {

    private static final float MARGIN = 40f;
    private static final float PAGE_TOP = PDRectangle.A4.getHeight() - MARGIN;
    private static final float SIGNATURE_BOX_WIDTH = 180f;
    private static final float SIGNATURE_BOX_HEIGHT = 80f;
    private static final float SIGNATURE_BOX_PADDING = 8f;

    private static final float PAGE2_COL_DATE_X = MARGIN;
    private static final float PAGE2_COL_VALEUR_X = MARGIN + 140f;
    private static final float PAGE2_COL_NOTE_X = MARGIN + 260f;
    private static final float PAGE2_ROW_HEIGHT = 16f;
    private static final float PAGE2_HEADER_HEIGHT = 20f;
    private static final float PAGE2_MIN_BOTTOM_Y = MARGIN + 25f;

    private static final DateTimeFormatter DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter PERIOD_FORMAT = DateTimeFormatter.ofPattern("MM/yyyy");
    private static final DateTimeFormatter PERIOD_FORMAT_LONG = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.FRENCH);

    private static final Map<DayOfWeek, String> SHORT_DAY_LABELS = Map.of(
            DayOfWeek.MONDAY, "Lun",
            DayOfWeek.TUESDAY, "Mar",
            DayOfWeek.WEDNESDAY, "Mer",
            DayOfWeek.THURSDAY, "Jeu",
            DayOfWeek.FRIDAY, "Ven",
            DayOfWeek.SATURDAY, "Sam",
            DayOfWeek.SUNDAY, "Dim"
    );

    private final PDType1Font regular = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
    private final PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
    private final PDType1Font italic = new PDType1Font(Standard14Fonts.FontName.HELVETICA_OBLIQUE);

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
        y -= 10f;

        float boxTop = y - 5f;
        float boxBottom = boxTop - SIGNATURE_BOX_HEIGHT;
        drawRectangle(cs, MARGIN, boxBottom, SIGNATURE_BOX_WIDTH, SIGNATURE_BOX_HEIGHT);

        CraPdfProviderSignature provider = signatures == null ? null : signatures.provider();
        if (provider != null) {
            float textX = MARGIN + SIGNATURE_BOX_PADDING;
            float textY = boxTop - SIGNATURE_BOX_PADDING - 11f;
            if (provider.name() != null && !provider.name().isEmpty()) {
                drawText(cs, regular, 11f, textX, textY, provider.name());
                textY -= 14f;
            }
            if (provider.signedAt() != null) {
                drawText(cs, regular, 11f, textX, textY, provider.signedAt().format(DATE_FORMAT));
                textY -= 14f;
            }
            if (provider.signatureImageRef() != null) {
                drawText(cs, regular, 9f, textX, textY, "[" + provider.signatureImageRef() + "]");
            }
        }

        return boxBottom - 5f;
    }

    private void drawClientSignatureBlock(PDPageContentStream cs, float startY) throws IOException {
        float y = startY;
        drawText(cs, bold, 12f, MARGIN, y, "Signature client");
        y -= 10f;
        float boxTop = y - 5f;
        float boxBottom = boxTop - SIGNATURE_BOX_HEIGHT;
        drawRectangle(cs, MARGIN, boxBottom, SIGNATURE_BOX_WIDTH, SIGNATURE_BOX_HEIGHT);
        drawText(cs, regular, 9f, MARGIN + SIGNATURE_BOX_PADDING, boxTop - SIGNATURE_BOX_PADDING - 9f, "À signer");
    }

    private void renderPage2(PDDocument pdf, CraPdfDocument document) throws IOException {
        PDPage page = new PDPage(PDRectangle.A4);
        pdf.addPage(page);
        float tableWidth = PDRectangle.A4.getWidth() - 2 * MARGIN;
        PDPageContentStream cs = new PDPageContentStream(pdf, page);
        try {
            float y = PAGE_TOP;

            drawText(cs, bold, 14f, MARGIN, y, "Détail journalier");
            y -= 20f;

            CraPdfSummary summary = document.page1();
            if (summary != null && summary.period() != null) {
                drawText(cs, regular, 11f, MARGIN, y, "Période : " + summary.period().format(PERIOD_FORMAT_LONG));
                y -= 18f;
            }
            y -= 4f;

            y = drawTableHeader(cs, tableWidth, y);

            List<CraPdfDayEntry> days = document.page2Days();
            if (days == null || days.isEmpty()) {
                return;
            }

            int workedFullIndex = 0;
            for (CraPdfDayEntry entry : days) {
                if (y < PAGE2_MIN_BOTTOM_Y + PAGE2_ROW_HEIGHT) {
                    cs.close();
                    cs = null;
                    PDPage nextPage = new PDPage(PDRectangle.A4);
                    pdf.addPage(nextPage);
                    cs = new PDPageContentStream(pdf, nextPage);
                    y = PAGE_TOP;
                    y = drawTableHeader(cs, tableWidth, y);
                }

                float rowBottom = y - PAGE2_ROW_HEIGHT;
                drawFilledRect(cs, MARGIN, rowBottom, tableWidth, PAGE2_ROW_HEIGHT, rowBackground(entry, workedFullIndex));

                boolean secondary = isSecondary(entry.type());
                PDType1Font rowFont = secondary ? italic : regular;
                Color textColor = secondary ? new Color(113, 128, 150) : Color.BLACK;

                drawColoredText(cs, rowFont, 9f, PAGE2_COL_DATE_X + 3f, y - 12f, buildDateCell(entry), textColor);
                drawColoredText(cs, rowFont, 9f, PAGE2_COL_VALEUR_X + 3f, y - 12f, workedValue(entry), textColor);
                if (entry.comment() != null && !entry.comment().isEmpty()) {
                    drawColoredText(cs, rowFont, 9f, PAGE2_COL_NOTE_X + 3f, y - 12f, entry.comment(), textColor);
                }
                drawHorizontalLine(cs, MARGIN, MARGIN + tableWidth, rowBottom, new Color(203, 213, 224));

                if (entry.type() == CraPdfDayType.WORKED_FULL) {
                    workedFullIndex++;
                }
                y = rowBottom;
            }

            if (y < PAGE2_MIN_BOTTOM_Y + PAGE2_ROW_HEIGHT) {
                cs.close();
                cs = null;
                PDPage nextPage = new PDPage(PDRectangle.A4);
                pdf.addPage(nextPage);
                cs = new PDPageContentStream(pdf, nextPage);
                y = PAGE_TOP;
            }
            float totalBottom = y - PAGE2_ROW_HEIGHT;
            drawFilledRect(cs, MARGIN, totalBottom, tableWidth, PAGE2_ROW_HEIGHT, new Color(219, 234, 254));
            drawColoredText(cs, bold, 9f, PAGE2_COL_DATE_X + 3f, y - 12f, "Total", Color.BLACK);
            BigDecimal total = summary != null ? summary.totalWorkedDays() : BigDecimal.ZERO;
            drawColoredText(cs, bold, 9f, PAGE2_COL_VALEUR_X + 3f, y - 12f, formatFraction(total), Color.BLACK);
            drawHorizontalLine(cs, MARGIN, MARGIN + tableWidth, totalBottom, new Color(203, 213, 224));
        } finally {
            if (cs != null) {
                cs.close();
            }
        }
    }

    private float drawTableHeader(PDPageContentStream cs, float tableWidth, float y) throws IOException {
        float headerBottom = y - PAGE2_HEADER_HEIGHT;
        drawFilledRect(cs, MARGIN, headerBottom, tableWidth, PAGE2_HEADER_HEIGHT, new Color(45, 55, 72));
        float textY = y - 14f;
        drawColoredText(cs, bold, 9f, PAGE2_COL_DATE_X + 3f, textY, "Date", Color.WHITE);
        drawColoredText(cs, bold, 9f, PAGE2_COL_VALEUR_X + 3f, textY, "Valeur", Color.WHITE);
        drawColoredText(cs, bold, 9f, PAGE2_COL_NOTE_X + 3f, textY, "Note", Color.WHITE);
        return headerBottom;
    }

    private Color rowBackground(CraPdfDayEntry entry, int workedFullIndex) {
        return switch (entry.type()) {
            case WORKED_FULL -> workedFullIndex % 2 == 0 ? Color.WHITE : new Color(247, 250, 252);
            case WORKED_HALF -> new Color(255, 251, 235);
            case WEEKEND -> new Color(226, 232, 240);
            case HOLIDAY, NOT_WORKED -> new Color(241, 245, 249);
        };
    }

    private boolean isSecondary(CraPdfDayType type) {
        return type == CraPdfDayType.WEEKEND || type == CraPdfDayType.NOT_WORKED || type == CraPdfDayType.HOLIDAY;
    }

    private String buildDateCell(CraPdfDayEntry entry) {
        String label = entry.dayOfWeek() != null ? SHORT_DAY_LABELS.getOrDefault(entry.dayOfWeek(), "") : "";
        String date = entry.date() != null ? entry.date().format(DATE_FORMAT) : "";
        return (label + " " + date).trim();
    }

    private String workedValue(CraPdfDayEntry entry) {
        return switch (entry.type()) {
            case WORKED_FULL -> "1";
            case WORKED_HALF -> "0.5";
            default -> "0";
        };
    }

    private void drawFilledRect(PDPageContentStream cs, float x, float y, float width, float height, Color color) throws IOException {
        cs.setNonStrokingColor(color);
        cs.addRect(x, y, width, height);
        cs.fill();
    }

    private void drawHorizontalLine(PDPageContentStream cs, float x1, float x2, float y, Color color) throws IOException {
        cs.setStrokingColor(color);
        cs.moveTo(x1, y);
        cs.lineTo(x2, y);
        cs.stroke();
    }

    private void drawColoredText(PDPageContentStream cs, PDType1Font font, float size, float x, float y, String text, Color color) throws IOException {
        cs.setNonStrokingColor(color);
        cs.beginText();
        cs.setFont(font, size);
        cs.newLineAtOffset(x, y);
        cs.showText(text);
        cs.endText();
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

    private String formatFraction(BigDecimal value) {
        if (value == null) {
            return "0";
        }
        return value.toPlainString();
    }
}
