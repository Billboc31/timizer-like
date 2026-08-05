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
            "Acme SARL", "12345678901234", "1 rue Paix", "75001", "Paris", "France");

    @Test
    void getSettings_returns200WithAllFields() throws Exception {
        when(service.getSettings()).thenReturn(SETTINGS);

        mockMvc.perform(get("/api/provider-settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.raisonSociale").value("Acme SARL"))
                .andExpect(jsonPath("$.siret").value("12345678901234"))
                .andExpect(jsonPath("$.adresse").value("1 rue Paix"))
                .andExpect(jsonPath("$.codePostal").value("75001"))
                .andExpect(jsonPath("$.ville").value("Paris"))
                .andExpect(jsonPath("$.pays").value("France"));
    }

    @Test
    void putSettings_validBody_returns200() throws Exception {
        when(service.updateSettings(any(ProviderSettingsDto.class))).thenReturn(SETTINGS);

        mockMvc.perform(put("/api/provider-settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "raisonSociale": "Acme SARL",
                                  "siret": "12345678901234",
                                  "adresse": "1 rue Paix",
                                  "codePostal": "75001",
                                  "ville": "Paris",
                                  "pays": "France"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.raisonSociale").value("Acme SARL"));
    }

    @Test
    void putSettings_blankRaisonSociale_returns400() throws Exception {
        mockMvc.perform(put("/api/provider-settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "raisonSociale": ""
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
