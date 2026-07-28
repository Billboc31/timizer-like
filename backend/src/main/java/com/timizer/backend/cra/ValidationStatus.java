package com.timizer.backend.cra;

public enum ValidationStatus {
    DRAFT,
    READY_FOR_PROVIDER_SIGNATURE,
    SIGNED_BY_PROVIDER,
    AWAITING_CLIENT_SIGNATURE,
    FULLY_SIGNED,
    VALIDATED
}
