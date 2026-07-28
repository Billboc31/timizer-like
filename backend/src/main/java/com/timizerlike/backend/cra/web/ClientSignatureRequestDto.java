package com.timizerlike.backend.cra.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ClientSignatureRequestDto(
        @NotBlank String signerName,
        String signerRole,
        @NotNull Boolean consentApproved,
        @NotBlank String signatureImageBase64
) {
}
