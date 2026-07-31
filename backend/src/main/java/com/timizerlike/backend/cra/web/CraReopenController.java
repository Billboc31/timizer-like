package com.timizerlike.backend.cra.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.cra.service.CraReopenService;

@RestController
@RequestMapping("/api/cras/{craId}/reopen")
public class CraReopenController {

    private final CraReopenService reopenService;

    public CraReopenController(CraReopenService reopenService) {
        this.reopenService = reopenService;
    }

    @PostMapping
    public ResponseEntity<Void> reopen(@PathVariable Long craId) {
        reopenService.reopen(craId);
        return ResponseEntity.noContent().build();
    }
}
