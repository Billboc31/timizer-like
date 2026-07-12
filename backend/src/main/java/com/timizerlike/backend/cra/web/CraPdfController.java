package com.timizerlike.backend.cra.web;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.cra.service.CraPdfAssemblerService;

@RestController
@RequestMapping("/api/cras/{craId}/pdf")
public class CraPdfController {

    private final CraPdfAssemblerService assemblerService;

    public CraPdfController(CraPdfAssemblerService assemblerService) {
        this.assemblerService = assemblerService;
    }

    @GetMapping
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long craId) {
        byte[] content = assemblerService.generatePdf(craId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .body(content);
    }
}
