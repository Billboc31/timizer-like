package com.timizerlike.backend.cra.web;

import jakarta.validation.Valid;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.cra.service.ClientSignatureService;

@RestController
@RequestMapping("/public/cra-link")
public class PublicCraSigningController {

    private final ClientSignatureService clientSignatureService;

    public PublicCraSigningController(ClientSignatureService clientSignatureService) {
        this.clientSignatureService = clientSignatureService;
    }

    @PostMapping("/{token}/sign")
    public ResponseEntity<Map<String, String>> sign(
            @PathVariable String token,
            @Valid @RequestBody ClientSignatureRequestDto request) {
        String downloadToken = clientSignatureService.sign(
                token,
                request.signerName(),
                request.signerRole(),
                Boolean.TRUE.equals(request.consentApproved()),
                request.signatureImageBase64());
        return ResponseEntity.ok(Map.of("downloadToken", downloadToken));
    }
}
