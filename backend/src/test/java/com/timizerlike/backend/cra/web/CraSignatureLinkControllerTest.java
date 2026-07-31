package com.timizerlike.backend.cra.web;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.InvalidCraTransitionException;
import com.timizer.backend.cra.TokenNotFoundException;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDayEntryDto;
import com.timizerlike.backend.cra.dto.CraPublicViewDto;
import com.timizerlike.cra.service.CraSignatureTokenService;

@WebMvcTest(controllers = {CraSignatureLinkController.class, PublicCraViewController.class})
@Import({CraSignatureLinkController.class, PublicCraViewController.class, CraApiExceptionHandler.class})
class CraSignatureLinkControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CraSignatureTokenService tokenService;

    private static final CraPublicViewDto PUBLIC_VIEW = new CraPublicViewDto(
            42L, "AWAITING_CLIENT_SIGNATURE",
            7, 2026,
            "Alice", "Provider", "Provider Co",
            "Bob", "Client", "Client Co",
            "bob@client.example",
            LocalDate.of(2026, 7, 31),
            10.5,
            List.of(new CraDayEntryDto(1, 1.0, null)));

    // ── POST /api/cras/{craId}/signature-link ────────────────────────────────

    @Test
    void postSignatureLinkReturns201WithSignatureUrl() throws Exception {
        when(tokenService.generateToken(1L)).thenReturn("raw-token-abc");

        mockMvc.perform(post("/api/cras/1/signature-link"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.signatureUrl").value(containsString("/sign/raw-token-abc")));
    }

    @Test
    void postSignatureLinkReturns409WhenCraNotAwaitingClientSignature() throws Exception {
        when(tokenService.generateToken(1L))
                .thenThrow(new InvalidCraTransitionException(1L, ValidationStatus.DRAFT, "generate-token"));

        mockMvc.perform(post("/api/cras/1/signature-link"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("invalid_cra_transition"));
    }

    @Test
    void postSignatureLinkReturns404WhenCraNotFound() throws Exception {
        when(tokenService.generateToken(99L)).thenThrow(new CraNotFoundException(99L));

        mockMvc.perform(post("/api/cras/99/signature-link"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("cra_not_found"));
    }

    // ── DELETE /api/cras/{craId}/signature-link ──────────────────────────────

    @Test
    void deleteSignatureLinkReturns204() throws Exception {
        doNothing().when(tokenService).revokeToken(1L);

        mockMvc.perform(delete("/api/cras/1/signature-link"))
                .andExpect(status().isNoContent());

        verify(tokenService).revokeToken(1L);
    }

    // ── GET /public/cra-link/{token} ─────────────────────────────────────────

    @Test
    void getPublicCraReturns200WithViewFields() throws Exception {
        when(tokenService.resolveToken("valid-token")).thenReturn(PUBLIC_VIEW);

        mockMvc.perform(get("/public/cra-link/valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.month").value(7))
                .andExpect(jsonPath("$.year").value(2026))
                .andExpect(jsonPath("$.providerFirstName").value("Alice"))
                .andExpect(jsonPath("$.clientFirstName").value("Bob"))
                .andExpect(jsonPath("$.totalWorkedDays").value(10.5))
                .andExpect(jsonPath("$.dayEntries").isArray())
                .andExpect(jsonPath("$.dayEntries[0].day").value(1));
    }

    @Test
    void getPublicCraExposesStatusAndCraIdButNotRawId() throws Exception {
        when(tokenService.resolveToken("valid-token")).thenReturn(PUBLIC_VIEW);

        mockMvc.perform(get("/public/cra-link/valid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("AWAITING_CLIENT_SIGNATURE"))
                .andExpect(jsonPath("$.craId").value(42))
                .andExpect(jsonPath("$.id").doesNotExist());
    }

    @Test
    void getPublicCraReturns404WithTokenInvalidForBadToken() throws Exception {
        when(tokenService.resolveToken("bad-token")).thenThrow(new TokenNotFoundException());

        mockMvc.perform(get("/public/cra-link/bad-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("token_invalid"));
    }

    @Test
    void getPublicCraReturns404AfterRevoke() throws Exception {
        when(tokenService.resolveToken(anyString())).thenThrow(new TokenNotFoundException());

        mockMvc.perform(get("/public/cra-link/revoked-token"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("token_invalid"));
    }
}
