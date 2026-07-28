package com.timizerlike.backend.cra.web;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.cra.service.CraClientSignService;

@RestController
@RequestMapping("/api/cras/{craId}/client-sign")
public class CraClientSignController {

    private final CraClientSignService clientSignService;

    public CraClientSignController(CraClientSignService clientSignService) {
        this.clientSignService = clientSignService;
    }

    @PostMapping
    public CraDetailsDto clientSign(
            @PathVariable Long craId,
            @Valid @RequestBody ClientSignRequestDto request) {
        return clientSignService.clientSign(
                craId,
                request.clientRepresentativeName(),
                request.clientSignatureDate(),
                request.signatureImageBase64());
    }
}
