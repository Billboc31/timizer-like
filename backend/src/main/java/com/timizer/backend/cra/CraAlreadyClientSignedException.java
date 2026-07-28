package com.timizer.backend.cra;

public class CraAlreadyClientSignedException extends RuntimeException {

    public CraAlreadyClientSignedException(Long id) {
        super("CRA " + id + " has already been signed by the client");
    }
}
