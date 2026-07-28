package com.timizer.backend.cra;

public class TokenNotFoundException extends RuntimeException {

    public TokenNotFoundException() {
        super("Signature token not found or invalid");
    }
}
