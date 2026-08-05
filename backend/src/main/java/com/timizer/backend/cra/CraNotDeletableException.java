package com.timizer.backend.cra;

public class CraNotDeletableException extends RuntimeException {

    public CraNotDeletableException(Long id) {
        super("CRA cannot be deleted in its current status: " + id);
    }
}
