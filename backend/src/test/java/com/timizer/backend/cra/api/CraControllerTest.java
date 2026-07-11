package com.timizer.backend.cra.api;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.timizer.backend.cra.MonthlyCraCreationService;
import com.timizer.backend.cra.MonthlyCraCreationService.CraCreationResult;
import com.timizerlike.backend.cra.dto.CraDayEntryDto;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;

@WebMvcTest(CraController.class)
@Import(CraController.class)
class CraControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MonthlyCraCreationService creationService;

    @Test
    void returnsHttp201WhenCraIsCreated() throws Exception {
        CraDetailsDto dto = new CraDetailsDto(
                42L,
                3,
                2025,
                21.0,
                CraStatus.DRAFT,
                List.of(new CraDayEntryDto(1, 0.0, null), new CraDayEntryDto(2, 0.0, null)),
                null,
                null
        );
        when(creationService.createForMonth(2025, 3)).thenReturn(new CraCreationResult(dto, true));

        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":2025,\"month\":3}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.month").value(3))
                .andExpect(jsonPath("$.year").value(2025))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.days.length()").value(2));
    }

    @Test
    void returnsHttp200WhenCraAlreadyExists() throws Exception {
        CraDetailsDto dto = new CraDetailsDto(
                7L,
                4,
                2025,
                20.0,
                CraStatus.DRAFT,
                List.of(),
                null,
                null
        );
        when(creationService.createForMonth(2025, 4)).thenReturn(new CraCreationResult(dto, false));

        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":2025,\"month\":4}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7));
    }

    @Test
    void returnsHttp400WhenMonthIsOutOfRange() throws Exception {
        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":2025,\"month\":13}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsHttp400WhenYearIsOutOfRange() throws Exception {
        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":1999,\"month\":3}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsHttp400WhenFieldIsMissing() throws Exception {
        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":2025}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsHttp400WhenFieldIsNonNumeric() throws Exception {
        mockMvc.perform(post("/api/cra")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"year\":2025,\"month\":\"three\"}"))
                .andExpect(status().isBadRequest());
    }
}
