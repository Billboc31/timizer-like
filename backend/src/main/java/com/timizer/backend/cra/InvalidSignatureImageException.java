package com.timizer.backend.cra;

public class InvalidSignatureImageException extends RuntimeException {

    public InvalidSignatureImageException() {
        super("Signature image must be a valid data URI (data:image/...)");
    }
}
