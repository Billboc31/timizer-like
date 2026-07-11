package com.timizerlike.backend.cra.dto;

/**
 * null workValue → leave work value unchanged.
 * null note → leave note unchanged.
 * "" (empty string) note → clear the note (stored as null).
 */
public record CraDayUpdateRequestDto(
        Double workValue,
        String note
) {
}
