package com.timizer.backend.cra;

public class TokenExpiredException extends RuntimeException {

    public TokenExpiredException() {
        super("Signature link has expired");
    }
}
