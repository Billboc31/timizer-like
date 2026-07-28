package com.timizer.backend.cra;

public class ConsentNotGivenException extends RuntimeException {

    public ConsentNotGivenException() {
        super("Client must explicitly approve the CRA before signing");
    }
}
