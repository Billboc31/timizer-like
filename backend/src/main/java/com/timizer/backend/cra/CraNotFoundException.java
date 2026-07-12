package com.timizer.backend.cra;

public class CraNotFoundException extends RuntimeException {

    public CraNotFoundException(Long id) {
        super("CRA not found with id: " + id);
    }

    public CraNotFoundException(int year, int month) {
        super("CRA not found for " + year + "/" + String.format("%02d", month));
    }
}
