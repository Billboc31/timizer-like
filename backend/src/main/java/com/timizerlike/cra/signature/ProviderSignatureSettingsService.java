package com.timizerlike.cra.signature;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizer.backend.cra.signature.ProviderSignatureSettings;
import com.timizer.backend.cra.signature.ProviderSignatureSettingsRepository;

@Service
public class ProviderSignatureSettingsService {

    private final ProviderSignatureSettingsRepository repository;

    public ProviderSignatureSettingsService(ProviderSignatureSettingsRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public Optional<ProviderSignatureSettings> get() {
        return repository.findById(1L);
    }

    @Transactional
    public ProviderSignatureSettings save(String signerName, String signatureImage) {
        ProviderSignatureSettings settings = repository.findById(1L)
                .orElse(new ProviderSignatureSettings(signerName, signatureImage));
        settings.setSignerName(signerName);
        settings.setSignatureImage(signatureImage);
        return repository.save(settings);
    }

    @Transactional
    public void delete() {
        repository.deleteById(1L);
    }
}
