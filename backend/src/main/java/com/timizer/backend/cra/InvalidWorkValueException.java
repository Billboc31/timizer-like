package com.timizer.backend.cra;

public class InvalidWorkValueException extends RuntimeException {

    private final double workValue;

    public InvalidWorkValueException(double workValue) {
        super("Work value " + workValue + " is not allowed. Allowed values are 0, 0.5, and 1.");
        this.workValue = workValue;
    }

    public double getWorkValue() {
        return workValue;
    }
}
