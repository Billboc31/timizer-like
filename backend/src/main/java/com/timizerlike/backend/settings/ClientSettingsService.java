package com.timizerlike.backend.settings;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.timizerlike.cra.config.CraDefaultsProperties;

@Service
public class ClientSettingsService {

    private final ClientSettingsRepository repository;
    private final CraDefaultsProperties defaults;

    public ClientSettingsService(ClientSettingsRepository repository, CraDefaultsProperties defaults) {
        this.repository = repository;
        this.defaults = defaults;
    }

    @Transactional
    public ClientSettingsDto get() {
        return repository.findById(1L)
                .map(this::toDto)
                .orElseGet(() -> toDto(seed()));
    }

    @Transactional
    public ClientSettingsDto update(ClientSettingsDto dto) {
        ClientSettings settings = repository.findById(1L).orElseGet(() -> {
            ClientSettings s = new ClientSettings();
            s.setId(1L);
            return s;
        });
        settings.setClientCompany(dto.clientCompany());
        settings.setClientAddress(dto.clientAddress());
        settings.setContactFullName(dto.contactFullName());
        settings.setContactRole(dto.contactRole());
        settings.setContactEmail(dto.contactEmail());
        return toDto(repository.save(settings));
    }

    private ClientSettings seed() {
        CraDefaultsProperties.Client client = defaults.client();
        CraDefaultsProperties.Client.Contact contact = client.contact();
        ClientSettings s = new ClientSettings();
        s.setId(1L);
        s.setClientCompany(client.name());
        s.setClientAddress(client.address());
        s.setContactFullName(contact.name());
        s.setContactRole("Contact");
        s.setContactEmail(contact.email());
        return repository.save(s);
    }

    private ClientSettingsDto toDto(ClientSettings s) {
        return new ClientSettingsDto(
                s.getClientCompany(),
                s.getClientAddress(),
                s.getContactFullName(),
                s.getContactRole(),
                s.getContactEmail()
        );
    }
}
