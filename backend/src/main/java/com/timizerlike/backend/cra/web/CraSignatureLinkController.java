package com.timizerlike.backend.cra.web;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.cra.config.TimizerProperties;
import com.timizerlike.cra.service.CraSignatureTokenService;

@RestController
@RequestMapping("/api/cras/{craId}/signature-link")
public class CraSignatureLinkController {

    private final CraSignatureTokenService tokenService;
    private final TimizerProperties properties;

    public CraSignatureLinkController(CraSignatureTokenService tokenService, TimizerProperties properties) {
        this.tokenService = tokenService;
        this.properties = properties;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> generateLink(@PathVariable Long craId) {
        String rawToken = tokenService.generateToken(craId);
        String signatureUrl = properties.publicFrontendBaseUrl() + "/sign/" + rawToken;
        return Map.of("signatureUrl", signatureUrl);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeLink(@PathVariable Long craId) {
        tokenService.revokeToken(craId);
    }
}
