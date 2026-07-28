package com.timizerlike.backend.provider;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.timizerlike.backend.provider.web.ProviderSettingsController;

@WebMvcTest(ProviderSettingsController.class)
@Import(ProviderSettingsController.class)
class ProviderSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ProviderSettingsService service;

    private static final ProviderSettingsDto SETTINGS = new ProviderSettingsDto(
            "Jean", "Dupont", "Acme", "1 rue Paix", "jean@acme.com", "0600000000");

    @Test
    void getSettings_returns200WithAllFields() throws Exception {
        when(service.getSettings()).thenReturn(SETTINGS);

        mockMvc.perform(get("/api/provider-settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jean"))
                .andExpect(jsonPath("$.lastName").value("Dupont"))
                .andExpect(jsonPath("$.company").value("Acme"))
                .andExpect(jsonPath("$.address").value("1 rue Paix"))
                .andExpect(jsonPath("$.email").value("jean@acme.com"))
                .andExpect(jsonPath("$.phone").value("0600000000"));
    }

    @Test
    void putSettings_validBody_returns200() throws Exception {
        when(service.updateSettings(any(ProviderSettingsDto.class))).thenReturn(SETTINGS);

        mockMvc.perform(put("/api/provider-settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "Jean",
                                  "lastName": "Dupont",
                                  "company": "Acme",
                                  "address": "1 rue Paix",
                                  "email": "jean@acme.com",
                                  "phone": "0600000000"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Jean"));
    }

    @Test
    void putSettings_blankFirstName_returns400() throws Exception {
        mockMvc.perform(put("/api/provider-settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "firstName": "",
                                  "lastName": "Dupont",
                                  "company": "Acme"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
