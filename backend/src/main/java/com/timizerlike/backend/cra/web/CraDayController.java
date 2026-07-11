package com.timizerlike.backend.cra.web;

import java.time.LocalDate;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.backend.cra.dto.CraDayUpdateRequestDto;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.cra.service.CraDayUpdateService;

@RestController
@RequestMapping("/api/cras/{craId}/days/{date}")
public class CraDayController {

    private final CraDayUpdateService updateService;

    public CraDayController(CraDayUpdateService updateService) {
        this.updateService = updateService;
    }

    @PatchMapping
    public CraDetailsDto updateDay(
            @PathVariable Long craId,
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestBody CraDayUpdateRequestDto request) {
        return updateService.updateDay(craId, date, request);
    }
}
