package com.timizerlike.cra.pdf;

import org.springframework.stereotype.Component;

import com.timizerlike.cra.pdf.model.CraPdfClientSignature;
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
import org.apache.pdfbox.pdmodel.graphics.image.PDImageXObject;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.TreeSet;

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
    private static final DateTimeFormatter DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm").withZone(ZoneId.of("Europe/Paris"));
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

    private record PageState(PDPage page, PDPageContentStream cs, float y) {}

    public byte[] generate(CraPdfDocument document) {
        PDDocument pdf = new PDDocument();
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            PageState state = renderCoverPage(pdf, document);
            try {
                state = renderDetailSections(pdf, document, state);
            } finally {
                state.cs().close();
            }
            pdf.save(out);
            return out.toByteArray();
        } catch (IOException e) {
            throw new IllegalStateException("Failed to generate CRA PDF", e);
        } finally {
            try { pdf.close(); } catch (IOException ignored) {}
        }
    }

    private PageState renderCoverPage(PDDocument pdf, CraPdfDocument document) throws IOException {
        PDPage page = new PDPage(PDRectangle.A4);
        pdf.addPage(page);
        PDPageContentStream cs = new PDPageContentStream(pdf, page);
        float y = PAGE_TOP;

        CraPdfSummary summary = document.page1();
        drawText(cs, bold, 14f, MARGIN, y, "Compte-Rendu d'Activité");
        y -= 20f;

        YearMonth period = summary != null ? summary.period() : null;
        if (period != null) {
            drawText(cs, regular, 10f, MARGIN, y, "Période : " + period.format(PERIOD_FORMAT_LONG));
        }
        y -= 16f;

        BigDecimal total = summary != null ? summary.totalWorkedDays() : null;
        drawText(cs, regular, 10f, MARGIN, y, "Total jours travaillés : " + formatFraction(total));
        y -= 24f;

        List<CraPdfDayEntry> days = document.page2Days();
        Map<LocalDate, CraPdfDayType> dayTypes = new HashMap<>();
        if (days != null) {
            for (CraPdfDayEntry entry : days) {
                if (entry.date() != null) {
                    dayTypes.put(entry.date(), entry.type());
                }
            }
        }

        TreeSet<YearMonth> months = new TreeSet<>();
        if (days != null) {
            for (CraPdfDayEntry entry : days) {
                if (entry.date() != null) {
                    months.add(YearMonth.from(entry.date()));
                }
            }
        }
        if (months.isEmpty() && period != null) {
            months.add(period);
        }

        float cardWidth = 160f;
        float cardHeight = 115f;
        float usableWidth = PDRectangle.A4.getWidth() - 2 * MARGIN;
        float colGap = (usableWidth - 3 * cardWidth) / 2f;
        float rowGap = 10f;

        int col = 0;
        int row = 0;
        for (YearMonth month : months) {
            float cx = MARGIN + col * (cardWidth + colGap);
            float cy = y - row * (cardHeight + rowGap);
            drawCalendarCard(cs, month, dayTypes, cx, cy, cardWidth, cardHeight);
            col++;
            if (col >= 3) {
                col = 0;
                row++;
            }
        }

        int totalRows = (months.size() + 2) / 3;
        float legendY = y - (totalRows - 1) * (cardHeight + rowGap) - cardHeight - 12f;
        drawCalendarLegend(cs, legendY);

        return new PageState(page, cs, legendY - 20f);
    }

    private void drawCalendarCard(PDPageContentStream cs, YearMonth month, Map<LocalDate, CraPdfDayType> dayTypes,
                                   float x, float y, float cardWidth, float cardHeight) throws IOException {
        drawFilledRect(cs, x, y - cardHeight, cardWidth, cardHeight, Color.WHITE);
        cs.setStrokingColor(new Color(203, 213, 224));
        cs.addRect(x, y - cardHeight, cardWidth, cardHeight);
        cs.stroke();

        String label = month.format(PERIOD_FORMAT_LONG);
        drawColoredText(cs, bold, 8f, x + 4f, y - 11f, label, new Color(45, 55, 72));

        float cellWidth = cardWidth / 7f;
        float cellHeight = 12f;

        String[] dowHeaders = {"L", "M", "M", "J", "V", "S", "D"};
        float dowY = y - 22f;
        for (int c = 0; c < 7; c++) {
            drawColoredText(cs, bold, 6f, x + c * cellWidth + cellWidth / 2f - 2f, dowY,
                    dowHeaders[c], new Color(107, 114, 128));
        }

        LocalDate firstOfMonth = month.atDay(1);
        LocalDate lastOfMonth = month.atEndOfMonth();
        int dowOffset = firstOfMonth.getDayOfWeek().getValue() - 1;
        LocalDate gridStart = firstOfMonth.minusDays(dowOffset);
        float gridTopY = y - 32f;

        for (int r = 0; r < 6; r++) {
            for (int c = 0; c < 7; c++) {
                LocalDate date = gridStart.plusDays((long) r * 7 + c);
                if (r > 0 && c == 0 && date.isAfter(lastOfMonth)) {
                    return;
                }
                float cellX = x + c * cellWidth;
                float cellTopY = gridTopY - r * cellHeight;
                boolean inMonth = !date.isBefore(firstOfMonth) && !date.isAfter(lastOfMonth);
                if (!inMonth) {
                    drawFilledRect(cs, cellX, cellTopY - cellHeight, cellWidth, cellHeight, new Color(247, 250, 252));
                } else {
                    CraPdfDayType type = dayTypes.get(date);
                    drawFilledRect(cs, cellX, cellTopY - cellHeight, cellWidth, cellHeight, calendarCellBg(type));
                    PDType1Font font = type == CraPdfDayType.HOLIDAY ? italic : regular;
                    drawColoredText(cs, font, 6f, cellX + 2f, cellTopY - cellHeight + 3f,
                            String.valueOf(date.getDayOfMonth()), calendarCellFg(type));
                }
            }
        }
    }

    private Color calendarCellBg(CraPdfDayType type) {
        if (type == null) return Color.WHITE;
        return switch (type) {
            case WORKED_FULL -> new Color(45, 55, 72);
            case WORKED_HALF -> new Color(74, 144, 217);
            case WEEKEND -> new Color(226, 232, 240);
            case HOLIDAY -> new Color(237, 242, 247);
            case NOT_WORKED -> Color.WHITE;
        };
    }

    private Color calendarCellFg(CraPdfDayType type) {
        if (type == null) return new Color(156, 163, 175);
        return switch (type) {
            case WORKED_FULL, WORKED_HALF -> Color.WHITE;
            case WEEKEND, HOLIDAY, NOT_WORKED -> new Color(107, 114, 128);
        };
    }

    private void drawCalendarLegend(PDPageContentStream cs, float y) throws IOException {
        float swatchSize = 8f;
        float x = MARGIN;

        drawFilledRect(cs, x, y - swatchSize, swatchSize, swatchSize, new Color(45, 55, 72));
        drawColoredText(cs, regular, 7f, x + swatchSize + 3f, y - 7f, "Jour travaillé", new Color(45, 55, 72));
        x += 80f;

        drawFilledRect(cs, x, y - swatchSize, swatchSize, swatchSize, new Color(74, 144, 217));
        drawColoredText(cs, regular, 7f, x + swatchSize + 3f, y - 7f, "Demi-journée", new Color(45, 55, 72));
        x += 80f;

        drawFilledRect(cs, x, y - swatchSize, swatchSize, swatchSize, new Color(247, 250, 252));
        cs.setStrokingColor(new Color(203, 213, 224));
        cs.addRect(x, y - swatchSize, swatchSize, swatchSize);
        cs.stroke();
        drawColoredText(cs, regular, 7f, x + swatchSize + 3f, y - 7f, "Non travaillé", new Color(45, 55, 72));
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

    // E1: adds else branch for pending provider; E2: adds role label
    private float drawProviderSignatureBlock(PDDocument pdf, PDPageContentStream cs, float startY, CraPdfProviderSignature provider) throws IOException {
        float y = startY;
        drawText(cs, bold, 12f, MARGIN, y, "Signature prestataire");
        y -= 15f;
        if (provider != null) {
            y = drawOptionalLine(cs, y, provider.name());
            if (provider.role() != null) {
                drawText(cs, italic, 9f, MARGIN, y, provider.role());
                y -= 13f;
            }
            if (provider.signedAt() != null) {
                drawText(cs, regular, 11f, MARGIN, y, "Signé le " + DATE_TIME_FORMAT.format(provider.signedAt()));
                y -= 14f;
            }
            float boxTop = y - 5f;
            float boxBottom = boxTop - SIGNATURE_BOX_HEIGHT;
            drawRectangle(cs, MARGIN, boxBottom, SIGNATURE_BOX_WIDTH, SIGNATURE_BOX_HEIGHT);
            embedSignatureImage(pdf, cs, provider.signatureImage(), MARGIN, boxBottom, SIGNATURE_BOX_WIDTH, SIGNATURE_BOX_HEIGHT);
            y = boxBottom - 5f;
        } else {
            float boxTop = y - 5f;
            float boxBottom = boxTop - SIGNATURE_BOX_HEIGHT;
            drawRectangle(cs, MARGIN, boxBottom, SIGNATURE_BOX_WIDTH, SIGNATURE_BOX_HEIGHT);
            drawText(cs, regular, 9f, MARGIN + 4f, boxTop - 15f, "En attente de signature");
            y = boxBottom - 5f;
        }
        return y;
    }

    // E2: adds role label; E3: adds validation wording; returns y for multi-month use in renderDetailSections
    private float drawClientSignatureBlock(PDDocument pdf, PDPageContentStream cs, float startY, CraPdfClientSignature client) throws IOException {
        float y = startY;
        drawText(cs, bold, 12f, MARGIN, y, "Signature client");
        y -= 15f;
        if (client != null && client.signedAt() != null) {
            y = drawOptionalLine(cs, y, client.clientRepresentativeName());
            if (client.role() != null) {
                drawText(cs, italic, 9f, MARGIN, y, client.role());
                y -= 13f;
            }
            drawText(cs, regular, 11f, MARGIN, y, "Signé le " + DATE_TIME_FORMAT.format(client.signedAt()));
            y -= 14f;
            drawText(cs, regular, 9f, MARGIN, y, "Lu et approuvé les éléments ci-dessus");
            y -= 13f;
            float boxTop = y - 5f;
            float boxBottom = boxTop - SIGNATURE_BOX_HEIGHT;
            drawRectangle(cs, MARGIN, boxBottom, SIGNATURE_BOX_WIDTH, SIGNATURE_BOX_HEIGHT);
            embedSignatureImage(pdf, cs, client.signatureImage(), MARGIN, boxBottom, SIGNATURE_BOX_WIDTH, SIGNATURE_BOX_HEIGHT);
            y = boxBottom - 5f;
        } else {
            float boxTop = y - 5f;
            float boxBottom = boxTop - SIGNATURE_BOX_HEIGHT;
            drawRectangle(cs, MARGIN, boxBottom, SIGNATURE_BOX_WIDTH, SIGNATURE_BOX_HEIGHT);
            drawText(cs, regular, 9f, MARGIN + 4f, boxTop - 15f, "En attente de signature");
            y = boxBottom - 5f;
        }
        return y;
    }

    // E4: draw "Signature illisible" on corrupt image instead of silently skipping
    private void embedSignatureImage(PDDocument pdf, PDPageContentStream cs, byte[] imageBytes, float x, float y, float w, float h) {
        if (imageBytes == null || imageBytes.length == 0) {
            return;
        }
        try {
            PDImageXObject image = PDImageXObject.createFromByteArray(pdf, imageBytes, "sig");
            float imgW = image.getWidth();
            float imgH = image.getHeight();
            float scale = Math.min(w / imgW, h / imgH);
            float drawW = imgW * scale;
            float drawH = imgH * scale;
            float drawX = x + (w - drawW) / 2f;
            float drawY = y + (h - drawH) / 2f;
            cs.drawImage(image, drawX, drawY, drawW, drawH);
        } catch (Exception e) {
            try {
                drawText(cs, regular, 9f, x + 4f, y + h / 2f, "Signature illisible");
            } catch (IOException ignored) {
            }
        }
    }

    // E5: group by YearMonth, draw per-month section with signature blocks; E6: removed drawClientValidationBlock
    private PageState renderDetailSections(PDDocument pdf, CraPdfDocument document, PageState state) throws IOException {
        float tableWidth = PDRectangle.A4.getWidth() - 2 * MARGIN;
        PDPageContentStream cs = state.cs();
        float y = state.y();

        drawText(cs, bold, 14f, MARGIN, y, "Détail journalier");
        y -= 30f;

        List<CraPdfDayEntry> days = document.page2Days();

        LinkedHashMap<YearMonth, List<CraPdfDayEntry>> monthGroups = new LinkedHashMap<>();
        if (days != null) {
            for (CraPdfDayEntry entry : days) {
                if (entry.date() != null) {
                    YearMonth ym = YearMonth.from(entry.date());
                    monthGroups.computeIfAbsent(ym, k -> new ArrayList<>()).add(entry);
                }
            }
        }

        CraPdfSignatures signatures = document.signatures();
        CraPdfProviderSignature provider = signatures == null ? null : signatures.provider();
        CraPdfClientSignature client = signatures == null ? null : signatures.client();

        if (monthGroups.isEmpty()) {
            y = drawTableHeader(cs, tableWidth, y);
            if (y < MARGIN + SIGNATURE_BOX_HEIGHT + 50f) {
                cs.close();
                cs = null;
                PDPage next = new PDPage(PDRectangle.A4);
                pdf.addPage(next);
                cs = new PDPageContentStream(pdf, next);
                y = PAGE_TOP;
            }
            y = drawProviderSignatureBlock(pdf, cs, y, provider);
            y -= 15f;
            if (y < MARGIN + SIGNATURE_BOX_HEIGHT + 50f) {
                cs.close();
                cs = null;
                PDPage next = new PDPage(PDRectangle.A4);
                pdf.addPage(next);
                cs = new PDPageContentStream(pdf, next);
                y = PAGE_TOP;
            }
            y = drawClientSignatureBlock(pdf, cs, y, client);
            return new PageState(state.page(), cs, y);
        }

        List<YearMonth> sortedMonths = new ArrayList<>(monthGroups.keySet());
        sortedMonths.sort(Comparator.naturalOrder());

        for (YearMonth ym : sortedMonths) {
            List<CraPdfDayEntry> monthDays = monthGroups.get(ym);

            // Month section header
            if (y < MARGIN + 40f) {
                cs.close();
                cs = null;
                PDPage next = new PDPage(PDRectangle.A4);
                pdf.addPage(next);
                cs = new PDPageContentStream(pdf, next);
                y = PAGE_TOP;
            }
            drawText(cs, bold, 12f, MARGIN, y, ym.format(PERIOD_FORMAT_LONG));
            y -= 20f;

            y = drawTableHeader(cs, tableWidth, y);

            BigDecimal monthTotal = BigDecimal.ZERO;
            int workedFullIndex = 0;
            for (CraPdfDayEntry entry : monthDays) {
                if (y < PAGE2_MIN_BOTTOM_Y + PAGE2_ROW_HEIGHT) {
                    cs.close();
                    cs = null;
                    PDPage next = new PDPage(PDRectangle.A4);
                    pdf.addPage(next);
                    cs = new PDPageContentStream(pdf, next);
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
                monthTotal = monthTotal.add(entry.workedFraction());
                y = rowBottom;
            }

            // Total row for this month
            if (y < PAGE2_MIN_BOTTOM_Y + PAGE2_ROW_HEIGHT) {
                cs.close();
                cs = null;
                PDPage next = new PDPage(PDRectangle.A4);
                pdf.addPage(next);
                cs = new PDPageContentStream(pdf, next);
                y = PAGE_TOP;
            }
            float totalBottom = y - PAGE2_ROW_HEIGHT;
            drawFilledRect(cs, MARGIN, totalBottom, tableWidth, PAGE2_ROW_HEIGHT, new Color(219, 234, 254));
            drawColoredText(cs, bold, 9f, PAGE2_COL_DATE_X + 3f, y - 12f, "Total", Color.BLACK);
            drawColoredText(cs, bold, 9f, PAGE2_COL_VALEUR_X + 3f, y - 12f, formatFraction(monthTotal), Color.BLACK);
            drawHorizontalLine(cs, MARGIN, MARGIN + tableWidth, totalBottom, new Color(203, 213, 224));
            y = totalBottom - 10f;

            // Provider signature block with page-overflow guard
            if (y < MARGIN + SIGNATURE_BOX_HEIGHT + 50f) {
                cs.close();
                cs = null;
                PDPage next = new PDPage(PDRectangle.A4);
                pdf.addPage(next);
                cs = new PDPageContentStream(pdf, next);
                y = PAGE_TOP;
            }
            y = drawProviderSignatureBlock(pdf, cs, y, provider);
            y -= 15f;

            // Client signature block with page-overflow guard
            if (y < MARGIN + SIGNATURE_BOX_HEIGHT + 50f) {
                cs.close();
                cs = null;
                PDPage next = new PDPage(PDRectangle.A4);
                pdf.addPage(next);
                cs = new PDPageContentStream(pdf, next);
                y = PAGE_TOP;
            }
            y = drawClientSignatureBlock(pdf, cs, y, client);
            y -= 20f;
        }

        return new PageState(state.page(), cs, y);
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
