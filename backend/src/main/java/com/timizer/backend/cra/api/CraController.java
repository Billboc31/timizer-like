package com.timizer.backend.cra.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizer.backend.cra.CraDetailsMapper;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.MonthlyCraCreationService;
import com.timizer.backend.cra.MonthlyCraCreationService.CraCreationResult;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizerlike.backend.cra.dto.CraDetailsDto;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/cra")
public class CraController {

    private final MonthlyCraCreationService creationService;
    private final MonthlyCraReportRepository repository;

    public CraController(MonthlyCraCreationService creationService, MonthlyCraReportRepository repository) {
        this.creationService = creationService;
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<CraDetailsDto> createCra(@Valid @RequestBody CreateCraRequest request) {
        CraCreationResult result = creationService.createForMonth(request.year(), request.month());
        HttpStatus status = result.created() ? HttpStatus.CREATED : HttpStatus.OK;
        return ResponseEntity.status(status).body(result.cra());
    }

    @GetMapping("/{id}")
    public CraDetailsDto getCraById(@PathVariable Long id) {
        return repository.findById(id)
                .map(CraDetailsMapper::toDto)
                .orElseThrow(() -> new CraNotFoundException(id));
    }

    @GetMapping("/{year}/{month}")
    public CraDetailsDto getCraByYearAndMonth(@PathVariable int year, @PathVariable int month) {
        return repository.findByMonthAndYear(month, year)
                .map(CraDetailsMapper::toDto)
                .orElseThrow(() -> new CraNotFoundException(null));
    }
}
