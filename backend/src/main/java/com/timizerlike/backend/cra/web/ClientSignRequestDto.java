package com.timizerlike.backend.cra.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ClientSignRequestDto(
        @NotBlank String clientRepresentativeName,
        @NotNull LocalDate clientSignatureDate,
        String signatureImageBase64
) {
}
