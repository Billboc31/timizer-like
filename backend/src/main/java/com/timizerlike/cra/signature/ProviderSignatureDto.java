package com.timizerlike.cra.signature;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProviderSignatureDto(
        @NotBlank String signerName,
        @NotBlank @Size(max = 700_000) String signatureImage) {
}
