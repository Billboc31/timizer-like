package com.timizerlike.cra.signature;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizer.backend.cra.signature.ProviderSignatureSettings;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/signature")
public class ProviderSignatureSettingsController {

    private final ProviderSignatureSettingsService service;

    public ProviderSignatureSettingsController(ProviderSignatureSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<ProviderSignatureDto> get() {
        return service.get()
                .map(s -> ResponseEntity.ok(new ProviderSignatureDto(s.getSignerName(), s.getSignatureImage())))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping
    public ProviderSignatureDto save(@Valid @RequestBody ProviderSignatureDto request) {
        ProviderSignatureSettings saved = service.save(request.signerName(), request.signatureImage());
        return new ProviderSignatureDto(saved.getSignerName(), saved.getSignatureImage());
    }

    @DeleteMapping
    public ResponseEntity<Void> delete() {
        service.delete();
        return ResponseEntity.noContent().build();
    }
}
