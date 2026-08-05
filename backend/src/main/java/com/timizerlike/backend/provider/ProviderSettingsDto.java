package com.timizerlike.backend.provider;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record ProviderSettingsDto(
        @NotBlank String raisonSociale,
        @Pattern(regexp = "^\\d{14}$") String siret,
        String adresse,
        String codePostal,
        String ville,
        String pays
) {}
