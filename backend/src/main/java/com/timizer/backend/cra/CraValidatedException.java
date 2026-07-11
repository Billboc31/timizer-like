package com.timizer.backend.cra;

public class CraValidatedException extends RuntimeException {

    public CraValidatedException(Long id) {
        super("CRA " + id + " is not in DRAFT status and cannot be modified");
    }
}
