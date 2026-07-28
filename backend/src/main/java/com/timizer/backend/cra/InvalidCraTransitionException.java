package com.timizer.backend.cra;

public class InvalidCraTransitionException extends RuntimeException {

    public InvalidCraTransitionException(Long id, ValidationStatus from, String action) {
        super("CRA " + id + " cannot perform '" + action + "' from state " + from);
    }
}
