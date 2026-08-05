package com.timizerlike.cra.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cra.defaults")
public record CraDefaultsProperties(Provider provider, Client client) {

    public record Provider(String raisonSociale, String adresse) {}

    public record Client(String name, String address, Contact contact) {
        public record Contact(String name, String email) {}
    }
}
