package com.timizerlike.cra.pdf.model;

import java.time.LocalDate;

public record CraPdfProviderSignature(
        String name,
        LocalDate signedAt,
        String signatureImageRef
) {}
