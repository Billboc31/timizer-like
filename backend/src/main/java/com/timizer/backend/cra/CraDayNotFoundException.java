package com.timizer.backend.cra;

import java.time.LocalDate;

public class CraDayNotFoundException extends RuntimeException {

    public CraDayNotFoundException(Long craId, LocalDate date) {
        super("Day entry not found for CRA " + craId + " on date " + date);
    }
}
