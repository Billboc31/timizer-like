package com.timizerlike.backend.cra.web;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.backend.cra.dto.CraSummaryDto;
import com.timizerlike.cra.service.CraHistoryService;

@RestController
@RequestMapping("/api/cras")
public class CraHistoryController {

    private final CraHistoryService historyService;

    public CraHistoryController(CraHistoryService historyService) {
        this.historyService = historyService;
    }

    @GetMapping
    public ResponseEntity<List<CraSummaryDto>> listHistory() {
        return ResponseEntity.ok(historyService.listHistory());
    }
}
