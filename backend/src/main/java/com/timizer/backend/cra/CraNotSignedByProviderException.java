package com.timizer.backend.cra;

public class CraNotSignedByProviderException extends RuntimeException {

    private final Long craId;

    public CraNotSignedByProviderException(Long craId) {
        super("CRA " + craId + " is not signed by provider");
        this.craId = craId;
    }

    public Long getCraId() {
        return craId;
    }
}
