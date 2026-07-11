package com.timizerlike.cra.pdf.model;

public record CraPdfParty(
        String name,
        String company,
        String address,
        CraPdfContact contact
) {}
