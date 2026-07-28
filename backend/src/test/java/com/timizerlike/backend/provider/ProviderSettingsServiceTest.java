package com.timizerlike.backend.provider;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.timizerlike.cra.config.CraDefaultsProperties;

class ProviderSettingsServiceTest {

    private static final CraDefaultsProperties DEFAULTS = new CraDefaultsProperties(
            new CraDefaultsProperties.Provider("Alice Provider", "Provider Co.", "1 rue Test"),
            new CraDefaultsProperties.Client(
                    "Lyra Network",
                    "Client Address",
                    new CraDefaultsProperties.Client.Contact("Bob Client", "bob@example.com")
            )
    );

    private ProviderSettingsRepository repository;
    private ProviderSettingsService service;

    @BeforeEach
    void setUp() {
        repository = mock(ProviderSettingsRepository.class);
        service = new ProviderSettingsService(repository, DEFAULTS);
    }

    @Test
    void getSettings_createsDefaultsOnFirstAccess() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        when(repository.save(any(ProviderSettings.class))).thenAnswer(inv -> inv.getArgument(0));

        ProviderSettingsDto dto = service.getSettings();

        assertThat(dto.firstName()).isEqualTo("Alice");
        assertThat(dto.lastName()).isEqualTo("Provider");
        assertThat(dto.company()).isEqualTo("Provider Co.");
        assertThat(dto.address()).isEqualTo("1 rue Test");
        assertThat(dto.email()).isNull();
        assertThat(dto.phone()).isNull();
    }

    @Test
    void getSettings_returnsExistingRow() {
        ProviderSettings existing = new ProviderSettings();
        existing.setId(1L);
        existing.setFirstName("Jean");
        existing.setLastName("Dupont");
        existing.setCompany("Acme");
        existing.setAddress("42 bd Haussmann");
        existing.setEmail("jean@acme.com");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        ProviderSettingsDto dto = service.getSettings();

        assertThat(dto.firstName()).isEqualTo("Jean");
        assertThat(dto.lastName()).isEqualTo("Dupont");
        assertThat(dto.company()).isEqualTo("Acme");
        assertThat(dto.address()).isEqualTo("42 bd Haussmann");
        assertThat(dto.email()).isEqualTo("jean@acme.com");
    }

    @Test
    void updateSettings_persistsAndReturnsDto() {
        ProviderSettingsDto dto = new ProviderSettingsDto(
                "Jean", "Dupont", "Acme", "1 rue Paix", "jean@acme.com", "0600000000");
        when(repository.findById(1L)).thenReturn(Optional.empty());
        when(repository.save(any(ProviderSettings.class))).thenAnswer(inv -> inv.getArgument(0));

        ProviderSettingsDto result = service.updateSettings(dto);

        assertThat(result.firstName()).isEqualTo("Jean");
        assertThat(result.lastName()).isEqualTo("Dupont");
        assertThat(result.company()).isEqualTo("Acme");
        assertThat(result.address()).isEqualTo("1 rue Paix");
        assertThat(result.email()).isEqualTo("jean@acme.com");
        assertThat(result.phone()).isEqualTo("0600000000");
    }

}
