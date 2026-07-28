package com.timizer.backend.cra;

public class DuplicateCraTransitionException extends RuntimeException {

    public DuplicateCraTransitionException(Long id, ValidationStatus targetState) {
        super("CRA " + id + " is already in state " + targetState);
    }
}
