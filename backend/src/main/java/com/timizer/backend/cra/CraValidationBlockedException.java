package com.timizer.backend.cra;

import java.util.List;

public class CraValidationBlockedException extends RuntimeException {

    private final List<CraValidationBlockingReason> reasons;

    public CraValidationBlockedException(List<CraValidationBlockingReason> reasons) {
        super("CRA validation blocked: " + reasons);
        this.reasons = List.copyOf(reasons);
    }

    public List<CraValidationBlockingReason> getReasons() {
        return reasons;
    }
}
