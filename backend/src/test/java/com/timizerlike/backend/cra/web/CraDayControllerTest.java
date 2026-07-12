package com.timizerlike.backend.cra.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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

import com.timizer.backend.cra.CraDayNotFoundException;
import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraValidatedException;
import com.timizer.backend.cra.InvalidWorkValueException;
import com.timizerlike.backend.cra.dto.CraDayEntryDto;
import com.timizerlike.backend.cra.dto.CraDayUpdateRequestDto;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;
import com.timizerlike.cra.service.CraDayUpdateService;

@WebMvcTest(CraDayController.class)
@Import({CraDayController.class, CraApiExceptionHandler.class})
class CraDayControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CraDayUpdateService updateService;

    private static final CraDetailsDto DRAFT_DTO = new CraDetailsDto(
            1L, 6, 2026, 0.5, CraStatus.DRAFT,
            List.of(new CraDayEntryDto(15, 0.5, "note")), null, null,
            null, null, null, null, null, null);

    @Test
    void returnsHttp200WithUpdatedDtoOnSuccess() throws Exception {
        when(updateService.updateDay(eq(1L), eq(LocalDate.of(2026, 6, 15)), any(CraDayUpdateRequestDto.class)))
                .thenReturn(DRAFT_DTO);

        mockMvc.perform(patch("/api/cras/1/days/2026-06-15")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"workValue\":0.5}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.month").value(6))
                .andExpect(jsonPath("$.year").value(2026))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.totalWorkedDays").value(0.5))
                .andExpect(jsonPath("$.days[0].worked").value(0.5))
                .andExpect(jsonPath("$.days[0].note").value("note"));
    }

    @Test
    void returnsHttp400OnInvalidWorkValue() throws Exception {
        when(updateService.updateDay(any(), any(), any()))
                .thenThrow(new InvalidWorkValueException(0.25));

        mockMvc.perform(patch("/api/cras/1/days/2026-06-15")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"workValue\":0.25}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("invalid_work_value"))
                .andExpect(jsonPath("$.value").value(0.25));
    }

    @Test
    void returnsHttp409OnValidatedCra() throws Exception {
        when(updateService.updateDay(any(), any(), any()))
                .thenThrow(new CraValidatedException(1L));

        mockMvc.perform(patch("/api/cras/1/days/2026-06-15")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"workValue\":0.5}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("cra_validated"));
    }

    @Test
    void returnsHttp404WhenCraNotFound() throws Exception {
        when(updateService.updateDay(any(), any(), any()))
                .thenThrow(new CraNotFoundException(99L));

        mockMvc.perform(patch("/api/cras/99/days/2026-06-15")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"workValue\":0.5}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("cra_not_found"));
    }

    @Test
    void returnsHttp404WhenDayNotFound() throws Exception {
        when(updateService.updateDay(any(), any(), any()))
                .thenThrow(new CraDayNotFoundException(1L, LocalDate.of(2026, 6, 15)));

        mockMvc.perform(patch("/api/cras/1/days/2026-06-15")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"workValue\":0.5}"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("cra_day_not_found"));
    }

    @Test
    void returnsHttp400OnMalformedDate() throws Exception {
        mockMvc.perform(patch("/api/cras/1/days/not-a-date")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"workValue\":0.5}"))
                .andExpect(status().isBadRequest());
    }
}
