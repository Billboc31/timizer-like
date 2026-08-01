package com.timizerlike.cra.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "timizer")
public record TimizerProperties(String publicFrontendBaseUrl) {}
