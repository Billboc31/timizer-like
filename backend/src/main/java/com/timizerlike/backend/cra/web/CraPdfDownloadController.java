package com.timizerlike.backend.cra.web;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.cra.service.CraPdfDownloadResult;
import com.timizerlike.cra.service.CraPdfDownloadService;

@RestController
@RequestMapping("/api/cras/{craId}/pdf")
public class CraPdfDownloadController {

    private final CraPdfDownloadService downloadService;

    public CraPdfDownloadController(CraPdfDownloadService downloadService) {
        this.downloadService = downloadService;
    }

    @GetMapping
    public ResponseEntity<byte[]> downloadPdf(@PathVariable Long craId) {
        CraPdfDownloadResult result = downloadService.download(craId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.filename() + "\"")
                .body(result.content());
    }
}
