package com.timizerlike.backend.settings;

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

@WebMvcTest(ClientSettingsController.class)
@Import(ClientSettingsController.class)
class ClientSettingsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClientSettingsService service;

    private static final ClientSettingsDto SEEDED = new ClientSettingsDto(
            "Lyra Network",
            "109 rue de l'Ancienne Poste, Villeurbanne",
            "Bob Client",
            "Manager",
            "bob@lyra.com"
    );

    @Test
    void getReturnsCurrentSettings() throws Exception {
        when(service.get()).thenReturn(SEEDED);

        mockMvc.perform(get("/api/settings/client"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientCompany").value("Lyra Network"))
                .andExpect(jsonPath("$.clientAddress").value("109 rue de l'Ancienne Poste, Villeurbanne"))
                .andExpect(jsonPath("$.contactFullName").value("Bob Client"))
                .andExpect(jsonPath("$.contactRole").value("Manager"))
                .andExpect(jsonPath("$.contactEmail").value("bob@lyra.com"));
    }

    @Test
    void putPersistsAndReturnsUpdatedSettings() throws Exception {
        ClientSettingsDto updated = new ClientSettingsDto(
                "New Corp",
                "1 rue Neuve, Paris",
                "Alice Doe",
                "Director",
                "alice@newcorp.com"
        );
        when(service.update(any(ClientSettingsDto.class))).thenReturn(updated);

        mockMvc.perform(put("/api/settings/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "clientCompany": "New Corp",
                                  "clientAddress": "1 rue Neuve, Paris",
                                  "contactFullName": "Alice Doe",
                                  "contactRole": "Director",
                                  "contactEmail": "alice@newcorp.com"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.clientCompany").value("New Corp"))
                .andExpect(jsonPath("$.contactEmail").value("alice@newcorp.com"));
    }

    @Test
    void putWithInvalidEmailReturns400() throws Exception {
        mockMvc.perform(put("/api/settings/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "clientCompany": "Lyra",
                                  "clientAddress": "1 rue Test",
                                  "contactFullName": "Alice",
                                  "contactRole": "Manager",
                                  "contactEmail": "not-an-email"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void putWithBlankRequiredFieldReturns400() throws Exception {
        mockMvc.perform(put("/api/settings/client")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "clientCompany": "",
                                  "clientAddress": "1 rue Test",
                                  "contactFullName": "Alice",
                                  "contactRole": "Manager",
                                  "contactEmail": "alice@example.com"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }
}
