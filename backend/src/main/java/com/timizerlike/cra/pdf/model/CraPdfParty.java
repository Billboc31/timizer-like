package com.timizerlike.cra.pdf.model;

public record CraPdfParty(
        String name,
        String siret,
        String company,
        String address,
        CraPdfContact contact
) {}
