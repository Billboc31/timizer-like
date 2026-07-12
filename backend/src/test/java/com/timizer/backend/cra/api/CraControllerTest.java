package com.timizer.backend.cra.api;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import com.timizer.backend.cra.MonthlyCraReport;
import com.timizer.backend.cra.MonthlyCraReportRepository;
import com.timizer.backend.cra.ValidationStatus;
import com.timizerlike.backend.cra.web.CraApiExceptionHandler;

@WebMvcTest(CraController.class)
@Import({ CraController.class, CraApiExceptionHandler.class })
class CraControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private MonthlyCraReportRepository repository;

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
