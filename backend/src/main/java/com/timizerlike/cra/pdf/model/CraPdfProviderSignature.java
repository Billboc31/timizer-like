package com.timizerlike.cra.pdf.model;

import java.time.Instant;

public record CraPdfProviderSignature(
        String name,
        String role,
        Instant signedAt,
        byte[] signatureImage
) {}
