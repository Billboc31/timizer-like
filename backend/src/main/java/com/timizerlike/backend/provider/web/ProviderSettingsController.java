package com.timizerlike.backend.provider.web;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.backend.provider.ProviderSettingsDto;
import com.timizerlike.backend.provider.ProviderSettingsService;

@RestController
@RequestMapping("/api/provider-settings")
public class ProviderSettingsController {

    private final ProviderSettingsService service;

    public ProviderSettingsController(ProviderSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ProviderSettingsDto getSettings() {
        return service.getSettings();
    }

    @PutMapping
    public ProviderSettingsDto updateSettings(@Valid @RequestBody ProviderSettingsDto dto) {
        return service.updateSettings(dto);
    }
}
