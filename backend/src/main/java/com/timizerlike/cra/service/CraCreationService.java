package com.timizerlike.cra.service;

import com.timizerlike.cra.config.CraDefaultsProperties;
import com.timizerlike.cra.model.CraMonthlyReport;
import org.springframework.stereotype.Service;

import java.time.YearMonth;

@Service
public class CraCreationService {

    private final CraDefaultsProperties defaults;

    public CraCreationService(CraDefaultsProperties defaults) {
        this.defaults = defaults;
    }

    public CraMonthlyReport createForMonth(YearMonth month) {
        CraDefaultsProperties.Provider provider = defaults.provider();
        CraDefaultsProperties.Client client = defaults.client();
        CraDefaultsProperties.Client.Contact contact = client.contact();
        return new CraMonthlyReport(
                month,
                provider.name(),
                provider.company(),
                provider.address(),
                client.name(),
                client.address(),
                contact.name(),
                contact.email()
        );
    }
}
