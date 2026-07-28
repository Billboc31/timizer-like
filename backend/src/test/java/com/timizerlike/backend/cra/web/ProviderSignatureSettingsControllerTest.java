package com.timizerlike.backend.cra.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.timizer.backend.cra.signature.ProviderSignatureSettings;
import com.timizerlike.cra.signature.ProviderSignatureSettingsController;
import com.timizerlike.cra.signature.ProviderSignatureSettingsService;

@WebMvcTest(ProviderSignatureSettingsController.class)
@Import({ProviderSignatureSettingsController.class, CraApiExceptionHandler.class})
class ProviderSignatureSettingsControllerTest {

    private static final String NAME = "Alice Dupont";
    private static final String IMAGE = "data:image/png;base64,abc123";
    private static final String VALID_BODY =
            "{\"signerName\":\"Alice Dupont\",\"signatureImage\":\"data:image/png;base64,abc123\"}";

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProviderSignatureSettingsService service;

    @Test
    void returnsHttp404WhenNoSignatureSaved() throws Exception {
        when(service.get()).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/signature"))
                .andExpect(status().isNotFound());
    }

    @Test
    void returnsHttp200WithDtoWhenSignatureExists() throws Exception {
        when(service.get()).thenReturn(Optional.of(new ProviderSignatureSettings(NAME, IMAGE)));

        mockMvc.perform(get("/api/signature"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signerName").value(NAME))
                .andExpect(jsonPath("$.signatureImage").value(IMAGE));
    }

    @Test
    void returnsHttp200WithDtoOnSave() throws Exception {
        when(service.save(any(), any())).thenReturn(new ProviderSignatureSettings(NAME, IMAGE));

        mockMvc.perform(put("/api/signature")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_BODY))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.signerName").value(NAME))
                .andExpect(jsonPath("$.signatureImage").value(IMAGE));
    }

    @Test
    void returnsHttp400WhenSaveBodyHasBlankFields() throws Exception {
        mockMvc.perform(put("/api/signature")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"signerName\":\"\",\"signatureImage\":\"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returnsHttp204OnDelete() throws Exception {
        mockMvc.perform(delete("/api/signature"))
                .andExpect(status().isNoContent());
    }
}
