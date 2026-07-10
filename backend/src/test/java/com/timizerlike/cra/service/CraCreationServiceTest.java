package com.timizerlike.cra.service;

import com.timizerlike.cra.config.CraDefaultsProperties;
import com.timizerlike.cra.model.CraMonthlyReport;
import org.junit.jupiter.api.Test;

import java.time.YearMonth;

import static org.assertj.core.api.Assertions.assertThat;

class CraCreationServiceTest {

    @Test
    void createForMonth_appliesConfiguredDefaults() {
        CraDefaultsProperties defaults = new CraDefaultsProperties(
                new CraDefaultsProperties.Provider(
                        "Test Provider",
                        "Test Provider Company",
                        "1 Test Provider Street"),
                new CraDefaultsProperties.Client(
                        "Test Client",
                        "2 Test Client Street",
                        new CraDefaultsProperties.Client.Contact(
                                "Test Client Contact",
                                "contact@test.example")));
        CraCreationService service = new CraCreationService(defaults);

        CraMonthlyReport report = service.createForMonth(YearMonth.of(2026, 3));

        assertThat(report.month()).isEqualTo(YearMonth.of(2026, 3));
        assertThat(report.providerName()).isEqualTo("Test Provider");
        assertThat(report.providerCompany()).isEqualTo("Test Provider Company");
        assertThat(report.providerAddress()).isEqualTo("1 Test Provider Street");
        assertThat(report.clientName()).isEqualTo("Test Client");
        assertThat(report.clientAddress()).isEqualTo("2 Test Client Street");
        assertThat(report.clientContactName()).isEqualTo("Test Client Contact");
        assertThat(report.clientContactEmail()).isEqualTo("contact@test.example");
    }
}
