package com.timizerlike.backend.cra.web;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.cra.service.CraSignatureTransitionService;

@RestController
@RequestMapping("/api/cras")
public class CraSignatureController {

    private final CraSignatureTransitionService transitionService;

    public CraSignatureController(CraSignatureTransitionService transitionService) {
        this.transitionService = transitionService;
    }

    @PostMapping("/{craId}/submit")
    public CraDetailsDto submit(@PathVariable Long craId) {
        return transitionService.submit(craId);
    }

    @PostMapping("/{craId}/sign-provider")
    public CraDetailsDto signByProvider(
            @PathVariable Long craId,
            @Valid @RequestBody SignProviderRequestDto request) {
        return transitionService.signByProvider(craId, request.providerSignatureDate());
    }

    @PostMapping("/{craId}/send-to-client")
    public CraDetailsDto sendToClient(@PathVariable Long craId) {
        return transitionService.sendToClient(craId);
    }
}
