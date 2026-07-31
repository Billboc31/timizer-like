package com.timizerlike.cra.pdf.model;

import java.time.Instant;

public record CraPdfClientSignature(
        String clientRepresentativeName,
        String role,
        Instant signedAt,
        byte[] signatureImage
) {}
