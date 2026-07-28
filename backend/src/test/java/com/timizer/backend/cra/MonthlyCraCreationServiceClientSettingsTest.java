package com.timizer.backend.cra;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.timizer.backend.cra.MonthlyCraCreationService.CraCreationResult;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.provider.ProviderSettingsDto;
import com.timizerlike.backend.provider.ProviderSettingsService;
import com.timizerlike.backend.settings.ClientSettingsDto;
import com.timizerlike.backend.settings.ClientSettingsService;
import com.timizerlike.cra.config.CraDefaultsProperties;

class MonthlyCraCreationServiceClientSettingsTest {

    private static final CraDefaultsProperties DEFAULTS = new CraDefaultsProperties(
            new CraDefaultsProperties.Provider("Alice Provider", "Provider Co.", "1 rue Test"),
            new CraDefaultsProperties.Client(
                    "Lyra Network",
                    "Client Address",
                    new CraDefaultsProperties.Client.Contact("Bob Client", "bob@example.com")
            )
    );

    private static final ProviderSettingsDto DEFAULT_PROVIDER = new ProviderSettingsDto(
            "Alice", "Provider", "Provider Co.", "1 rue Test", null, null);

    @Test
    void newCraUsesCurrentClientSettings() {
        MonthlyCraReportRepository repository = mock(MonthlyCraReportRepository.class);
        when(repository.findByMonthAndYear(7, 2026)).thenReturn(Optional.empty());
        when(repository.save(any(MonthlyCraReport.class))).thenAnswer(inv -> inv.getArgument(0));

        ClientSettingsService clientSettingsService = mock(ClientSettingsService.class);
        when(clientSettingsService.get()).thenReturn(new ClientSettingsDto(
                "Acme Corp",
                "42 rue du Test, Lyon",
                "Jane Smith",
                "Director",
                "jane@acme.com"
        ));

        ProviderSettingsService providerSettingsService = mock(ProviderSettingsService.class);
        when(providerSettingsService.getSettings()).thenReturn(DEFAULT_PROVIDER);
        MonthlyCraCreationService service = new MonthlyCraCreationService(repository, DEFAULTS, clientSettingsService, providerSettingsService);

        CraDetailsDto dto = service.createForMonth(2026, 7).cra();

        assertThat(dto.clientCompany()).isEqualTo("Acme Corp");
        assertThat(dto.clientAddress()).isEqualTo("42 rue du Test, Lyon");
        assertThat(dto.clientFirstName()).isEqualTo("Jane");
        assertThat(dto.clientLastName()).isEqualTo("Smith");
        assertThat(dto.clientContactRole()).isEqualTo("Director");
    }

    @Test
    void savedCraRetainsClientFieldsAfterSettingsChange() {
        MonthlyCraReportRepository repository = mock(MonthlyCraReportRepository.class);
        when(repository.findByMonthAndYear(7, 2026)).thenReturn(Optional.empty());
        when(repository.findByMonthAndYear(8, 2026)).thenReturn(Optional.empty());
        when(repository.save(any(MonthlyCraReport.class))).thenAnswer(inv -> inv.getArgument(0));

        ClientSettingsService clientSettingsService = mock(ClientSettingsService.class);
        ClientSettingsDto settingsA = new ClientSettingsDto(
                "Old Corp",
                "1 Old Street",
                "Old Contact",
                "Manager",
                "old@corp.com"
        );
        ClientSettingsDto settingsB = new ClientSettingsDto(
                "New Corp",
                "2 New Street",
                "New Contact",
                "Director",
                "new@corp.com"
        );

        // First CRA created with settingsA
        when(clientSettingsService.get()).thenReturn(settingsA);
        ProviderSettingsService providerSettingsService = mock(ProviderSettingsService.class);
        when(providerSettingsService.getSettings()).thenReturn(DEFAULT_PROVIDER);
        MonthlyCraCreationService service = new MonthlyCraCreationService(repository, DEFAULTS, clientSettingsService, providerSettingsService);
        CraDetailsDto firstCra = service.createForMonth(2026, 7).cra();

        assertThat(firstCra.clientCompany()).isEqualTo("Old Corp");

        // Settings change to B — a subsequent new CRA uses B
        when(clientSettingsService.get()).thenReturn(settingsB);
        CraDetailsDto secondCra = service.createForMonth(2026, 8).cra();

        assertThat(secondCra.clientCompany()).isEqualTo("New Corp");
        // The first CRA entity was saved with Old Corp values (snapshot at creation time)
        assertThat(firstCra.clientCompany()).isEqualTo("Old Corp");
    }
}
