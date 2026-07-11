# timizer-like backend

Spring Boot backend for the Timizer-like application.

## CRA PDF generation

CRA reports are rendered to a two-page PDF using [Apache PDFBox](https://pdfbox.apache.org/) `3.0.3`.
Entry point: `com.timizerlike.cra.pdf.CraPdfGenerator#generate(CraPdfDocument)` returns the encoded
bytes for the PDF. The class is a plain POJO (no Spring annotations) and can be instantiated and
called from any future controller or service.
