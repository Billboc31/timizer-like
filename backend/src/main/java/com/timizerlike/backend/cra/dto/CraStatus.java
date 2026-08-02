package com.timizerlike.backend.cra.dto;

public enum CraStatus {
    DRAFT,
    READY_FOR_PROVIDER_SIGNATURE,
    SIGNED_BY_PROVIDER,
    AWAITING_CLIENT_SIGNATURE,
    VALIDATED
}
