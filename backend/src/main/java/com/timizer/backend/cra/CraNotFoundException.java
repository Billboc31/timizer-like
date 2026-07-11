package com.timizer.backend.cra;

public class CraNotFoundException extends RuntimeException {

    public CraNotFoundException(Long id) {
        super("CRA not found: " + id);
    }
}
