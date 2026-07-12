package com.timizerlike.backend.cra.web;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.timizer.backend.cra.CraDayNotFoundException;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraNotValidatedException;
import com.timizer.backend.cra.CraValidatedException;
import com.timizer.backend.cra.InvalidWorkValueException;

@RestControllerAdvice
public class CraApiExceptionHandler {

    @ExceptionHandler(InvalidWorkValueException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidWorkValue(InvalidWorkValueException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "invalid_work_value", "value", ex.getWorkValue()));
    }

    @ExceptionHandler(CraValidatedException.class)
    public ResponseEntity<Map<String, String>> handleCraValidated() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "cra_validated"));
    }

    @ExceptionHandler(CraNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleCraNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "cra_not_found"));
    }

    @ExceptionHandler(CraDayNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleCraDayNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "cra_day_not_found"));
    }

    @ExceptionHandler(CraNotValidatedException.class)
    public ResponseEntity<Map<String, String>> handleCraNotValidated() {
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY)
                .body(Map.of("error", "cra_not_validated"));
    }
}
