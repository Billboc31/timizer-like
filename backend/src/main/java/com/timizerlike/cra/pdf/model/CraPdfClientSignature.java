package com.timizerlike.cra.pdf.model;

import java.time.LocalDate;

public record CraPdfClientSignature(
        String clientRepresentativeName,
        LocalDate signedAt,
        String signatureImageRef
) {}
