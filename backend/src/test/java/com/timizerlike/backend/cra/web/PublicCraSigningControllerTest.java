package com.timizerlike.backend.cra.web;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import com.timizer.backend.cra.ConsentNotGivenException;
import com.timizer.backend.cra.CraNotSignedByProviderException;
import com.timizer.backend.cra.TokenAlreadyConsumedException;
import com.timizer.backend.cra.TokenNotFoundException;
import com.timizerlike.cra.service.ClientSignatureService;

@WebMvcTest(PublicCraSigningController.class)
@Import({PublicCraSigningController.class, CraApiExceptionHandler.class})
class PublicCraSigningControllerTest {

    private static final String TOKEN = "test-token";
    private static final String VALID_PAYLOAD = """
            {
              "signerName": "Bob Martin",
              "signerRole": "Responsable",
              "consentApproved": true,
              "signatureImageBase64": "data:image/png;base64,abc123"
            }
            """;

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ClientSignatureService clientSignatureService;

    @Test
    void returns200OnValidPayload() throws Exception {
        doNothing().when(clientSignatureService).sign(eq(TOKEN), any(), any(), eq(true), any());

        mockMvc.perform(post("/public/cra-link/{token}/sign", TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_PAYLOAD))
                .andExpect(status().isOk());
    }

    @Test
    void returns410WhenTokenAlreadyConsumed() throws Exception {
        doThrow(new TokenAlreadyConsumedException())
                .when(clientSignatureService).sign(any(), any(), any(), eq(true), any());

        mockMvc.perform(post("/public/cra-link/{token}/sign", TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_PAYLOAD))
                .andExpect(status().isGone())
                .andExpect(jsonPath("$.error").value("token_already_consumed"));
    }

    @Test
    void returns404WhenTokenNotFound() throws Exception {
        doThrow(new TokenNotFoundException())
                .when(clientSignatureService).sign(any(), any(), any(), eq(true), any());

        mockMvc.perform(post("/public/cra-link/{token}/sign", TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_PAYLOAD))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("token_invalid"));
    }

    @Test
    void returns400WhenSignerNameMissing() throws Exception {
        mockMvc.perform(post("/public/cra-link/{token}/sign", TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "signerName": "",
                                  "consentApproved": true,
                                  "signatureImageBase64": "data:image/png;base64,abc"
                                }
                                """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void returns400WhenConsentNotGiven() throws Exception {
        doThrow(new ConsentNotGivenException())
                .when(clientSignatureService).sign(any(), any(), any(), eq(false), any());

        mockMvc.perform(post("/public/cra-link/{token}/sign", TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "signerName": "Bob",
                                  "consentApproved": false,
                                  "signatureImageBase64": "data:image/png;base64,abc"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("consent_not_given"));
    }

    @Test
    void returns409WhenCraNotInSignedByProviderStatus() throws Exception {
        doThrow(new CraNotSignedByProviderException(1L))
                .when(clientSignatureService).sign(any(), any(), any(), eq(true), any());

        mockMvc.perform(post("/public/cra-link/{token}/sign", TOKEN)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_PAYLOAD))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("cra_not_signed"));
    }
}
