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
        settings.setFirstName(dto.firstName());
        settings.setLastName(dto.lastName());
        settings.setCompany(dto.company());
        settings.setAddress(dto.address());
        settings.setEmail(dto.email());
        settings.setPhone(dto.phone());
        return toDto(repository.save(settings));
    }

    private ProviderSettingsDto seedDefaults() {
        CraDefaultsProperties.Provider provider = defaults.provider();
        String[] parts = splitName(provider.name());
        ProviderSettings settings = new ProviderSettings();
        settings.setId(1L);
        settings.setFirstName(parts[0]);
        settings.setLastName(parts[1]);
        settings.setCompany(provider.company() != null ? provider.company() : "");
        settings.setAddress(provider.address());
        return toDto(repository.save(settings));
    }

    private ProviderSettingsDto toDto(ProviderSettings s) {
        return new ProviderSettingsDto(
                s.getFirstName(), s.getLastName(), s.getCompany(),
                s.getAddress(), s.getEmail(), s.getPhone());
    }

    private static String[] splitName(String fullName) {
        if (fullName == null || fullName.isBlank()) {
            return new String[]{"Unknown", "Unknown"};
        }
        String trimmed = fullName.trim();
        int idx = trimmed.indexOf(' ');
        if (idx < 0) {
            return new String[]{trimmed, trimmed};
        }
        String first = trimmed.substring(0, idx).trim();
        String last = trimmed.substring(idx + 1).trim();
        if (first.isEmpty()) first = trimmed;
        if (last.isEmpty()) last = trimmed;
        return new String[]{first, last};
    }
}
