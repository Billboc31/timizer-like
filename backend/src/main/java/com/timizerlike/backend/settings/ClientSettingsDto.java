package com.timizerlike.backend.settings;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ClientSettingsDto(
        @NotBlank String clientCompany,
        @NotBlank String clientAddress,
        @NotBlank String contactFullName,
        @NotBlank String contactRole,
        @NotBlank @Email String contactEmail
) {
}
