package com.timizerlike.backend.cra.web;

import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.cra.service.CraSignatureTokenService;

@RestController
@RequestMapping("/api/cras/{craId}/signature-link")
public class CraSignatureLinkController {

    private final CraSignatureTokenService tokenService;

    public CraSignatureLinkController(CraSignatureTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> generateLink(
            @PathVariable Long craId,
            HttpServletRequest request) {
        String rawToken = tokenService.generateToken(craId);
        String signatureUrl = buildSignatureUrl(request, rawToken);
        return Map.of("signatureUrl", signatureUrl);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void revokeLink(@PathVariable Long craId) {
        tokenService.revokeToken(craId);
    }

    private static String buildSignatureUrl(HttpServletRequest request, String rawToken) {
        String scheme = request.getScheme();
        String host = request.getServerName();
        int port = request.getServerPort();
        boolean isDefaultPort = ("http".equals(scheme) && port == 80)
                || ("https".equals(scheme) && port == 443);
        String base = isDefaultPort
                ? scheme + "://" + host
                : scheme + "://" + host + ":" + port;
        return base + "/sign/" + rawToken;
    }
}
