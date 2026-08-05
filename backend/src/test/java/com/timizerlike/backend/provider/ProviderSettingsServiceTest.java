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
            new CraDefaultsProperties.Provider("Provider Co.", "1 rue Test"),
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

        assertThat(dto.raisonSociale()).isEqualTo("Provider Co.");
        assertThat(dto.adresse()).isEqualTo("1 rue Test");
        assertThat(dto.siret()).isNull();
        assertThat(dto.codePostal()).isNull();
        assertThat(dto.ville()).isNull();
        assertThat(dto.pays()).isNull();
    }

    @Test
    void getSettings_returnsExistingRow() {
        ProviderSettings existing = new ProviderSettings();
        existing.setId(1L);
        existing.setRaisonSociale("Acme SARL");
        existing.setSiret("12345678901234");
        existing.setAdresse("42 bd Haussmann");
        existing.setVille("Paris");
        when(repository.findById(1L)).thenReturn(Optional.of(existing));

        ProviderSettingsDto dto = service.getSettings();

        assertThat(dto.raisonSociale()).isEqualTo("Acme SARL");
        assertThat(dto.siret()).isEqualTo("12345678901234");
        assertThat(dto.adresse()).isEqualTo("42 bd Haussmann");
        assertThat(dto.ville()).isEqualTo("Paris");
    }

    @Test
    void updateSettings_persistsAndReturnsDto() {
        ProviderSettingsDto dto = new ProviderSettingsDto(
                "Acme SARL", "12345678901234", "1 rue Paix", "75001", "Paris", "France");
        when(repository.findById(1L)).thenReturn(Optional.empty());
        when(repository.save(any(ProviderSettings.class))).thenAnswer(inv -> inv.getArgument(0));

        ProviderSettingsDto result = service.updateSettings(dto);

        assertThat(result.raisonSociale()).isEqualTo("Acme SARL");
        assertThat(result.siret()).isEqualTo("12345678901234");
        assertThat(result.adresse()).isEqualTo("1 rue Paix");
        assertThat(result.codePostal()).isEqualTo("75001");
        assertThat(result.ville()).isEqualTo("Paris");
        assertThat(result.pays()).isEqualTo("France");
    }

}
