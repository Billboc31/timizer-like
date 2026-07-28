package com.timizerlike.backend.provider;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record ProviderSettingsDto(
        @NotBlank String firstName,
        @NotBlank String lastName,
        @NotBlank String company,
        String address,
        @Email String email,
        String phone
) {}
