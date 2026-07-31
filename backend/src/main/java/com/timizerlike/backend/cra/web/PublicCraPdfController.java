package com.timizerlike.backend.cra.web;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizer.backend.cra.CraDownloadToken;
import com.timizer.backend.cra.CraDownloadTokenRepository;
import com.timizer.backend.cra.TokenNotFoundException;
import com.timizerlike.cra.service.CraPdfDownloadResult;
import com.timizerlike.cra.service.CraPdfDownloadService;

@RestController
@RequestMapping("/public/cra")
public class PublicCraPdfController {

    private static final long TTL_SECONDS = 24 * 3600L;

    private final CraDownloadTokenRepository downloadTokenRepository;
    private final CraPdfDownloadService downloadService;

    public PublicCraPdfController(
            CraDownloadTokenRepository downloadTokenRepository,
            CraPdfDownloadService downloadService) {
        this.downloadTokenRepository = downloadTokenRepository;
        this.downloadService = downloadService;
    }

    @GetMapping("/{downloadToken}/pdf")
    public ResponseEntity<byte[]> downloadPublicPdf(@PathVariable String downloadToken) {
        String hash = sha256(downloadToken);

        CraDownloadToken token = downloadTokenRepository.findByTokenHash(hash)
                .orElseThrow(TokenNotFoundException::new);

        if (token.isUsed()) {
            throw new TokenNotFoundException();
        }

        if (Instant.now().isAfter(token.getCreatedAt().plusSeconds(TTL_SECONDS))) {
            throw new TokenNotFoundException();
        }

        token.markUsed();
        downloadTokenRepository.save(token);

        CraPdfDownloadResult result = downloadService.download(token.getCraId());
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + result.filename() + "\"")
                .body(result.content());
    }

    private static String sha256(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 not available", e);
        }
    }
}
