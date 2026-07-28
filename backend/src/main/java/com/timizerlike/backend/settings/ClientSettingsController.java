package com.timizerlike.backend.settings;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/settings/client")
public class ClientSettingsController {

    private final ClientSettingsService service;

    public ClientSettingsController(ClientSettingsService service) {
        this.service = service;
    }

    @GetMapping
    public ClientSettingsDto get() {
        return service.get();
    }

    @PutMapping
    public ClientSettingsDto update(@Valid @RequestBody ClientSettingsDto dto) {
        return service.update(dto);
    }
}
