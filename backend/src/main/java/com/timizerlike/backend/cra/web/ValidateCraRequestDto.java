package com.timizerlike.backend.cra.web;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ValidateCraRequestDto(
        @NotNull LocalDate providerSignatureDate,
        @NotBlank String providerSignatureImage,
        @NotBlank String providerSignerName
) {
}
