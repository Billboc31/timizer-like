package com.timizer.backend.cra;

public class CraNotValidatedException extends RuntimeException {

    public CraNotValidatedException(Long id) {
        super("CRA not validated: " + id);
    }
}
