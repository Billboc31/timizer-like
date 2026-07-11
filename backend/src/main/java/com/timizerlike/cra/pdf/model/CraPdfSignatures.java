package com.timizerlike.cra.pdf.model;

public record CraPdfSignatures(
        CraPdfProviderSignature provider,
        CraPdfClientSignature client
) {}
