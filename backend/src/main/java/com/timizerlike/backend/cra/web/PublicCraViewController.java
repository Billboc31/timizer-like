package com.timizerlike.backend.cra.web;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.timizerlike.backend.cra.dto.CraPublicViewDto;
import com.timizerlike.cra.service.CraSignatureTokenService;

@RestController
@RequestMapping("/public/cra-link")
public class PublicCraViewController {

    private final CraSignatureTokenService tokenService;

    public PublicCraViewController(CraSignatureTokenService tokenService) {
        this.tokenService = tokenService;
    }

    @GetMapping("/{token}")
    public CraPublicViewDto getPublicCra(@PathVariable String token) {
        return tokenService.resolveToken(token);
    }
}
