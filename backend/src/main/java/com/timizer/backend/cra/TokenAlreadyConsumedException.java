package com.timizer.backend.cra;

public class TokenAlreadyConsumedException extends RuntimeException {

    public TokenAlreadyConsumedException() {
        super("Signature token has already been consumed");
    }
}
