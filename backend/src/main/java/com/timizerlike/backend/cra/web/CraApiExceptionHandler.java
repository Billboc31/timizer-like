package com.timizerlike.backend.cra.web;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import com.timizer.backend.cra.ConsentNotGivenException;
import com.timizer.backend.cra.CraAlreadyClientSignedException;
import com.timizer.backend.cra.CraDayNotFoundException;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraNotSignedByProviderException;
import com.timizer.backend.cra.CraNotValidatedException;
import com.timizer.backend.cra.CraValidatedException;
import com.timizer.backend.cra.DuplicateCraTransitionException;
import com.timizer.backend.cra.InvalidCraTransitionException;
import com.timizer.backend.cra.InvalidSignatureImageException;
import com.timizer.backend.cra.InvalidWorkValueException;
import com.timizer.backend.cra.TokenAlreadyConsumedException;
import com.timizer.backend.cra.TokenNotFoundException;

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

    @ExceptionHandler(InvalidCraTransitionException.class)
    public ResponseEntity<Map<String, String>> handleInvalidCraTransition() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "invalid_cra_transition"));
    }

    @ExceptionHandler(DuplicateCraTransitionException.class)
    public ResponseEntity<Map<String, String>> handleDuplicateCraTransition() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "duplicate_cra_transition"));
    }

    @ExceptionHandler(TokenNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleTokenNotFound() {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "token_invalid"));
    }

    @ExceptionHandler(CraNotSignedByProviderException.class)
    public ResponseEntity<Map<String, String>> handleCraNotSignedByProvider() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "cra_not_signed"));
    }

    @ExceptionHandler(TokenAlreadyConsumedException.class)
    public ResponseEntity<Map<String, String>> handleTokenAlreadyConsumed() {
        return ResponseEntity.status(HttpStatus.GONE)
                .body(Map.of("error", "token_already_consumed"));
    }

    @ExceptionHandler(ConsentNotGivenException.class)
    public ResponseEntity<Map<String, String>> handleConsentNotGiven() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "consent_not_given"));
    }

    @ExceptionHandler(InvalidSignatureImageException.class)
    public ResponseEntity<Map<String, String>> handleInvalidSignatureImage() {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", "invalid_signature_image"));
    }

    @ExceptionHandler(CraAlreadyClientSignedException.class)
    public ResponseEntity<Map<String, String>> handleCraAlreadyClientSigned() {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("error", "cra_already_client_signed"));
    }
}
