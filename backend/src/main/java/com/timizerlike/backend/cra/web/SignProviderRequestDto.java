package com.timizerlike.backend.cra.web;

import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record SignProviderRequestDto(
        @NotNull LocalDate providerSignatureDate
) {
}
