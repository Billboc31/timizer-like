package com.timizerlike.backend.cra.web;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.cra.service.CraPdfDownloadResult;
import com.timizerlike.cra.service.CraPdfDownloadService;

@RestController
@RequestMapping("/public/cra")
public class PublicCraPdfController {

    private final MonthlyCraReportRepository craRepository;
    private final CraPdfDownloadService downloadService;

    public PublicCraPdfController(
            MonthlyCraReportRepository craRepository,
            CraPdfDownloadService downloadService) {
        this.craRepository = craRepository;
        this.downloadService = downloadService;
    }

    @GetMapping("/{craId}/pdf")
    public ResponseEntity<byte[]> downloadPublicPdf(@PathVariable Long craId) {
        MonthlyCraReport cra = craRepository.findById(craId)
                .orElseThrow(() -> new CraNotFoundException(craId));

        ValidationStatus status = cra.getStatus();
        if (status != ValidationStatus.FULLY_SIGNED && status != ValidationStatus.VALIDATED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        CraPdfDownloadResult result = downloadService.download(craId);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.filename() + "\"")
                .body(result.content());
    }
}
