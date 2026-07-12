package com.timizer.backend.cra.api;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizer.backend.cra.CraDetailsMapper;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizerlike.backend.cra.dto.CraDetailsDto;

@RestController
@RequestMapping("/api/cra")
public class CraController {

    private final MonthlyCraReportRepository repository;

    public CraController(MonthlyCraReportRepository repository) {
        this.repository = repository;
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
                .orElseThrow(() -> new CraNotFoundException(year, month));
    }
}
