package com.timizerlike.backend.cra.web;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.cra.service.CraValidationService;

@RestController
@RequestMapping("/api/cras/{craId}/validate")
public class CraValidationController {

    private final CraValidationService validationService;

    public CraValidationController(CraValidationService validationService) {
        this.validationService = validationService;
    }

    @PostMapping
    public CraDetailsDto validate(
            @PathVariable Long craId,
            @Valid @RequestBody ValidateCraRequestDto request) {
        return validationService.validate(craId, request.providerSignatureDate());
    }
}
