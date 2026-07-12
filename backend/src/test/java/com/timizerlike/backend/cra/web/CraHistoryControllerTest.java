package com.timizerlike.backend.cra.web;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
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

import com.timizerlike.backend.cra.dto.CraStatus;
import com.timizerlike.backend.cra.dto.CraSummaryDto;
import com.timizerlike.cra.service.CraHistoryService;

@WebMvcTest(CraHistoryController.class)
@Import({CraHistoryController.class, CraApiExceptionHandler.class})
class CraHistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CraHistoryService historyService;

    @Test
    void returnsHttp200WithEmptyList() throws Exception {
        when(historyService.listHistory()).thenReturn(List.of());

        mockMvc.perform(get("/api/cras"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void returnsHttp200WithSummaries() throws Exception {
        List<CraSummaryDto> summaries = List.of(
                new CraSummaryDto(1L, 6, 2026, 20.0, CraStatus.VALIDATED, LocalDate.of(2026, 6, 30)),
                new CraSummaryDto(2L, 5, 2026, 15.0, CraStatus.DRAFT, null)
        );
        when(historyService.listHistory()).thenReturn(summaries);

        mockMvc.perform(get("/api/cras"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].month").value(6))
                .andExpect(jsonPath("$[0].year").value(2026))
                .andExpect(jsonPath("$[0].totalWorkedDays").value(20.0))
                .andExpect(jsonPath("$[0].status").value("VALIDATED"))
                .andExpect(jsonPath("$[0].validationDate").value("2026-06-30"))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].status").value("DRAFT"))
                .andExpect(jsonPath("$[1].validationDate").doesNotExist());
    }
}
