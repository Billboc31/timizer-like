package com.timizerlike.backend.cra.integration;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Map;

import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;

import com.timizerlike.cra.TimizerLikeApplication;

@SpringBootTest(classes = TimizerLikeApplication.class, webEnvironment = WebEnvironment.RANDOM_PORT)
class CraSignatureWorkflowIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        restTemplate.getRestTemplate().setRequestFactory(
                new HttpComponentsClientHttpRequestFactory(HttpClients.createDefault()));
    }

    @Test
    @SuppressWarnings("unchecked")
    void fullSignatureWorkflow() {
        // Step 1: Create a CRA — expect 201 DRAFT
        Map<String, Object> createBody = Map.of("year", 2026, "month", 8);
        ResponseEntity<Map<String, Object>> createResponse = restTemplate.exchange(
                "/api/cra", HttpMethod.POST,
                new HttpEntity<>(createBody),
                new ParameterizedTypeReference<>() {});

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Map<String, Object> cra = createResponse.getBody();
        assertThat(cra).isNotNull();
        assertThat(cra.get("status")).isEqualTo("DRAFT");
        Long craId = ((Number) cra.get("id")).longValue();

        // Verify PDF rejected for DRAFT (422)
        ResponseEntity<Map<String, Object>> pdfDraftResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null,
                new ParameterizedTypeReference<>() {});
        assertThat(pdfDraftResponse.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);

        // Verify day update rejected for non-DRAFT after submit (first verify update works while DRAFT)
        Map<String, Object> dayBody = Map.of("workValue", 1.0);
        ResponseEntity<Map<String, Object>> dayResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/days/2026-08-04",
                HttpMethod.PATCH,
                new HttpEntity<>(dayBody),
                new ParameterizedTypeReference<>() {});
        assertThat(dayResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Step 2: Submit — DRAFT → READY_FOR_PROVIDER_SIGNATURE
        ResponseEntity<Map<String, Object>> submitResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/submit",
                HttpMethod.POST,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {});

        assertThat(submitResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(submitResponse.getBody()).isNotNull();
        assertThat(submitResponse.getBody().get("status")).isEqualTo("READY_FOR_PROVIDER_SIGNATURE");

        // Verify PDF rejected for READY_FOR_PROVIDER_SIGNATURE (422)
        ResponseEntity<Map<String, Object>> pdfReadyResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null,
                new ParameterizedTypeReference<>() {});
        assertThat(pdfReadyResponse.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);

        // Verify day update rejected after submit (409)
        ResponseEntity<Map<String, Object>> dayUpdateRejected = restTemplate.exchange(
                "/api/cras/" + craId + "/days/2026-08-04",
                HttpMethod.PATCH,
                new HttpEntity<>(dayBody),
                new ParameterizedTypeReference<>() {});
        assertThat(dayUpdateRejected.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        // Verify duplicate submit returns 409 duplicate_cra_transition
        ResponseEntity<Map<String, Object>> duplicateSubmit = restTemplate.exchange(
                "/api/cras/" + craId + "/submit",
                HttpMethod.POST,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {});
        assertThat(duplicateSubmit.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(duplicateSubmit.getBody()).isNotNull();
        assertThat(duplicateSubmit.getBody().get("error")).isEqualTo("duplicate_cra_transition");

        // Verify invalid transition (READY_FOR_PROVIDER_SIGNATURE → send-to-client) returns 409 invalid_cra_transition
        ResponseEntity<Map<String, Object>> invalidTransition = restTemplate.exchange(
                "/api/cras/" + craId + "/send-to-client",
                HttpMethod.POST,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {});
        assertThat(invalidTransition.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(invalidTransition.getBody()).isNotNull();
        assertThat(invalidTransition.getBody().get("error")).isEqualTo("invalid_cra_transition");

        // Step 3: Sign by provider — READY_FOR_PROVIDER_SIGNATURE → SIGNED_BY_PROVIDER
        Map<String, Object> signBody = Map.of("providerSignatureDate", "2026-08-31");
        ResponseEntity<Map<String, Object>> signResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/sign-provider",
                HttpMethod.POST,
                new HttpEntity<>(signBody),
                new ParameterizedTypeReference<>() {});

        assertThat(signResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(signResponse.getBody()).isNotNull();
        assertThat(signResponse.getBody().get("status")).isEqualTo("SIGNED_BY_PROVIDER");
        assertThat(signResponse.getBody().get("providerSignatureDate")).isEqualTo("2026-08-31");

        // Verify PDF accepted for SIGNED_BY_PROVIDER (200)
        ResponseEntity<byte[]> pdfSignedResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null, byte[].class);
        assertThat(pdfSignedResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(pdfSignedResponse.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(pdfSignedResponse.getBody()).isNotEmpty();

        // Step 4a: Generate signature link — requires SIGNED_BY_PROVIDER
        ResponseEntity<Map<String, Object>> linkResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/signature-link",
                HttpMethod.POST,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {});

        assertThat(linkResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(linkResponse.getBody()).isNotNull();
        String signatureUrl = (String) linkResponse.getBody().get("signatureUrl");
        assertThat(signatureUrl).isNotBlank();
        String rawToken = signatureUrl.substring(signatureUrl.lastIndexOf('/') + 1);

        // Step 4b: Send to client — SIGNED_BY_PROVIDER → AWAITING_CLIENT_SIGNATURE
        ResponseEntity<Map<String, Object>> sendResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/send-to-client",
                HttpMethod.POST,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {});

        assertThat(sendResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(sendResponse.getBody()).isNotNull();
        assertThat(sendResponse.getBody().get("status")).isEqualTo("AWAITING_CLIENT_SIGNATURE");

        // Step 5: Client signs — AWAITING_CLIENT_SIGNATURE → FULLY_SIGNED
        Map<String, Object> clientSignBody = Map.of(
                "signerName", "Alice Client",
                "signerRole", "Responsable technique",
                "consentApproved", true,
                "signatureImageBase64", "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==");

        ResponseEntity<Void> clientSignResponse = restTemplate.exchange(
                "/public/cra-link/" + rawToken + "/sign",
                HttpMethod.POST,
                new HttpEntity<>(clientSignBody),
                Void.class);

        assertThat(clientSignResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Verify CRA transitioned to FULLY_SIGNED
        ResponseEntity<List<Map<String, Object>>> historyResponse = restTemplate.exchange(
                "/api/cras", HttpMethod.GET, null,
                new ParameterizedTypeReference<>() {});
        assertThat(historyResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(historyResponse.getBody()).isNotNull();
        Map<String, Object> signedCra = historyResponse.getBody().stream()
                .filter(c -> ((Number) c.get("id")).longValue() == craId)
                .findFirst()
                .orElseThrow(() -> new AssertionError("CRA not found in history"));
        assertThat(signedCra.get("status")).isEqualTo("FULLY_SIGNED");

        // Step 6: Re-signing with the same token must return 410 GONE
        ResponseEntity<Map<String, Object>> reSignResponse = restTemplate.exchange(
                "/public/cra-link/" + rawToken + "/sign",
                HttpMethod.POST,
                new HttpEntity<>(clientSignBody),
                new ParameterizedTypeReference<>() {});

        assertThat(reSignResponse.getStatusCode()).isEqualTo(HttpStatus.GONE);
        assertThat(reSignResponse.getBody()).isNotNull();
        assertThat(reSignResponse.getBody().get("error")).isEqualTo("token_already_consumed");
    }
}
