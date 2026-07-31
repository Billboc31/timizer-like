package com.timizer.backend.cra;

public class CraWrongStatusException extends RuntimeException {
    public CraWrongStatusException() {
        super("CRA is not available for client signature");
    }
}
