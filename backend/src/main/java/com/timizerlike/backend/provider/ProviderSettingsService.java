package com.timizerlike.backend.provider;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizerlike.cra.config.CraDefaultsProperties;

@Service
public class ProviderSettingsService {

    private final ProviderSettingsRepository repository;
    private final CraDefaultsProperties defaults;

    public ProviderSettingsService(ProviderSettingsRepository repository, CraDefaultsProperties defaults) {
        this.repository = repository;
        this.defaults = defaults;
    }

    @Transactional
    public ProviderSettingsDto getSettings() {
        return repository.findById(1L)
                .map(this::toDto)
                .orElseGet(this::seedDefaults);
    }

    @Transactional
    public ProviderSettingsDto updateSettings(ProviderSettingsDto dto) {
        ProviderSettings settings = repository.findById(1L).orElseGet(ProviderSettings::new);
        settings.setId(1L);
        settings.setRaisonSociale(dto.raisonSociale());
        settings.setSiret(dto.siret());
        settings.setAdresse(dto.adresse());
        settings.setCodePostal(dto.codePostal());
        settings.setVille(dto.ville());
        settings.setPays(dto.pays());
        return toDto(repository.save(settings));
    }

    private ProviderSettingsDto seedDefaults() {
        CraDefaultsProperties.Provider provider = defaults.provider();
        ProviderSettings settings = new ProviderSettings();
        settings.setId(1L);
        settings.setRaisonSociale(provider.raisonSociale() != null ? provider.raisonSociale() : "");
        settings.setAdresse(provider.adresse());
        return toDto(repository.save(settings));
    }

    private ProviderSettingsDto toDto(ProviderSettings s) {
        return new ProviderSettingsDto(
                s.getRaisonSociale(), s.getSiret(), s.getAdresse(),
                s.getCodePostal(), s.getVille(), s.getPays());
    }
}
