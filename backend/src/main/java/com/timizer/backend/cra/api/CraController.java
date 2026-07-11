package com.timizer.backend.cra.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizer.backend.cra.MonthlyCraCreationService;
import com.timizer.backend.cra.MonthlyCraCreationService.CraCreationResult;
import com.timizerlike.backend.cra.dto.CraDetailsDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cra")
public class CraController {

    private final MonthlyCraCreationService creationService;

    public CraController(MonthlyCraCreationService creationService) {
        this.creationService = creationService;
    }

    @PostMapping
    public ResponseEntity<CraDetailsDto> createCra(@Valid @RequestBody CreateCraRequest request) {
        CraCreationResult result = creationService.createForMonth(request.year(), request.month());
        HttpStatus status = result.created() ? HttpStatus.CREATED : HttpStatus.OK;
        return ResponseEntity.status(status).body(result.cra());
    }
}
