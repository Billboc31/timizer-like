package com.timizerlike.backend.cra.web;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.timizer.backend.cra.CraNotFoundException;
import com.timizer.backend.cra.CraNotValidatedException;
import com.timizerlike.cra.service.CraPdfDownloadResult;
import com.timizerlike.cra.service.CraPdfDownloadService;

@WebMvcTest(CraPdfDownloadController.class)
@Import({CraPdfDownloadController.class, CraApiExceptionHandler.class})
class CraPdfDownloadControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CraPdfDownloadService downloadService;

    @Test
    void returnsHttp200WithPdfContentOnSuccess() throws Exception {
        when(downloadService.download(1L))
                .thenReturn(new CraPdfDownloadResult(new byte[]{1, 2, 3}, "CRA-Acme-Client-2026-06.pdf"));

        mockMvc.perform(get("/api/cras/1/pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, containsString("CRA-Acme-Client-2026-06.pdf")));
    }

    @Test
    void returnsHttp404WhenCraNotFound() throws Exception {
        when(downloadService.download(99L))
                .thenThrow(new CraNotFoundException(99L));

        mockMvc.perform(get("/api/cras/99/pdf"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("cra_not_found"));
    }

    @Test
    void returnsHttp422WhenCraNotValidated() throws Exception {
        when(downloadService.download(1L))
                .thenThrow(new CraNotValidatedException(1L));

        mockMvc.perform(get("/api/cras/1/pdf"))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error").value("cra_not_validated"));
    }
}
