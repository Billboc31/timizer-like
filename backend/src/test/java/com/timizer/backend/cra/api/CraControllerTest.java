package com.timizer.backend.cra.api;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.timizer.backend.cra.MonthlyCraCreationService;
import com.timizer.backend.cra.MonthlyCraCreationService.CraCreationResult;
import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.dto.CraDayEntryDto;
import com.timizerlike.backend.cra.dto.CraDetailsDto;
import com.timizerlike.backend.cra.dto.CraStatus;
import com.timizerlike.backend.cra.web.CraApiExceptionHandler;

@WebMvcTest(CraController.class)
@Import({ CraController.class, CraApiExceptionHandler.class })
class CraControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MonthlyCraCreationService creationService;

    @MockBean
    private MonthlyCraReportRepository repository;

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

    @Test
    void returnsHttp200WithCraWhenFoundById() throws Exception {
        MonthlyCraReport report = buildReport(42L, 3, 2025);
        when(repository.findById(42L)).thenReturn(Optional.of(report));

        mockMvc.perform(get("/api/cra/42"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.month").value(3))
                .andExpect(jsonPath("$.year").value(2025))
                .andExpect(jsonPath("$.totalWorkedDays").value(0.0))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.days").isArray());
    }

    @Test
    void returnsHttp404WhenCraNotFoundById() throws Exception {
        when(repository.findById(999L)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/cra/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("cra_not_found"));
    }

    @Test
    void returnsHttp200WithCraWhenFoundByYearAndMonth() throws Exception {
        MonthlyCraReport report = buildReport(7L, 3, 2025);
        when(repository.findByMonthAndYear(3, 2025)).thenReturn(Optional.of(report));

        mockMvc.perform(get("/api/cra/2025/3"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(7))
                .andExpect(jsonPath("$.month").value(3))
                .andExpect(jsonPath("$.year").value(2025))
                .andExpect(jsonPath("$.totalWorkedDays").value(0.0))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.days").isArray());
    }

    @Test
    void returnsHttp404WhenCraNotFoundByYearAndMonth() throws Exception {
        when(repository.findByMonthAndYear(3, 2025)).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/cra/2025/3"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("cra_not_found"));
    }

    private MonthlyCraReport buildReport(Long id, int month, int year) {
        MonthlyCraReport report = mock(MonthlyCraReport.class);
        when(report.getId()).thenReturn(id);
        when(report.getMonth()).thenReturn(month);
        when(report.getYear()).thenReturn(year);
        when(report.getStatus()).thenReturn(ValidationStatus.DRAFT);
        when(report.getDayEntries()).thenReturn(List.of());
        when(report.getValidationDate()).thenReturn(null);
        when(report.getProviderSignatureDate()).thenReturn(null);
        return report;
    }
}
