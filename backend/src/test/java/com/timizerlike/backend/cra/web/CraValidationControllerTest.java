package com.timizerlike.backend.cra.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
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
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraValidatedException;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;
import com.timizerlike.cra.service.CraValidationService;

@WebMvcTest(CraValidationController.class)
@Import({CraValidationController.class, CraApiExceptionHandler.class})
class CraValidationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CraValidationService validationService;

    private static final CraDetailsDto VALIDATED_DTO = new CraDetailsDto(
            1L, 6, 2026, 20.0, CraStatus.VALIDATED,
            List.of(),
            LocalDate.of(2026, 6, 30),
            LocalDate.of(2026, 6, 30));

    @Test
    void returnsHttp200WithValidatedDtoOnSuccess() throws Exception {
        when(validationService.validate(eq(1L), any(LocalDate.class)))
                .thenReturn(VALIDATED_DTO);

        mockMvc.perform(post("/api/cras/1/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"providerSignatureDate\":\"2026-06-30\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.status").value("VALIDATED"))
                .andExpect(jsonPath("$.validationDate").value("2026-06-30"))
                .andExpect(jsonPath("$.providerSignatureDate").value("2026-06-30"));
    }

    @Test
    void returnsHttp404WhenCraNotFound() throws Exception {
        when(validationService.validate(any(), any()))
                .thenThrow(new CraNotFoundException(99L));

        mockMvc.perform(post("/api/cras/99/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"providerSignatureDate\":\"2026-06-30\"}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("cra_not_found"));
    }

    @Test
    void returnsHttp409WhenCraAlreadyValidated() throws Exception {
        when(validationService.validate(any(), any()))
                .thenThrow(new CraValidatedException(1L));

        mockMvc.perform(post("/api/cras/1/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"providerSignatureDate\":\"2026-06-30\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("cra_validated"));
    }

    @Test
    void returnsHttp400WhenProviderSignatureDateMissing() throws Exception {
        mockMvc.perform(post("/api/cras/1/validate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
