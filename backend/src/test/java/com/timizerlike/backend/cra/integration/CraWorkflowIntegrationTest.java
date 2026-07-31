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
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;

import com.timizerlike.cra.TimizerLikeApplication;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

@SpringBootTest(classes = TimizerLikeApplication.class, webEnvironment = WebEnvironment.RANDOM_PORT)
class CraWorkflowIntegrationTest {

    private static final String MIN_PNG =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAAAAAA6fptVAAAACklEQVQI12NgAAAAAgAB4iG8MwAAAABJRU5ErkJggg==";

    @Autowired
    private TestRestTemplate restTemplate;

    @BeforeEach
    void setUp() {
        restTemplate.getRestTemplate().setRequestFactory(
                new HttpComponentsClientHttpRequestFactory(HttpClients.createDefault()));
    }

    @Test
    @SuppressWarnings("unchecked")
    void fullCraWorkflow() {
        // Step 1: Create a CRA for July 2026 — expect 201 DRAFT
        Map<String, Object> createBody = Map.of("year", 2026, "month", 7);
        ResponseEntity<Map<String, Object>> createResponse = restTemplate.exchange(
                "/api/cra", HttpMethod.POST,
                new HttpEntity<>(createBody),
                new ParameterizedTypeReference<>() {});

        assertThat(createResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        Map<String, Object> cra = createResponse.getBody();
        assertThat(cra).isNotNull();
        assertThat(cra.get("status")).isEqualTo("DRAFT");
        Long craId = ((Number) cra.get("id")).longValue();

        // Step 2: Update a workday to 0.5 — expect 200 and totalWorkedDays > 0
        Map<String, Object> dayBody = Map.of("workValue", 0.5);
        ResponseEntity<Map<String, Object>> dayResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/days/2026-07-01",
                HttpMethod.PATCH,
                new HttpEntity<>(dayBody),
                new ParameterizedTypeReference<>() {});

        assertThat(dayResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        Map<String, Object> updatedCra = dayResponse.getBody();
        assertThat(updatedCra).isNotNull();
        assertThat(((Number) updatedCra.get("totalWorkedDays")).doubleValue()).isGreaterThan(0.0);

        // PDF rejected while still DRAFT (422)
        ResponseEntity<Map<String, Object>> pdfDraftResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null,
                new ParameterizedTypeReference<>() {});
        assertThat(pdfDraftResponse.getStatusCode()).isEqualTo(HttpStatus.UNPROCESSABLE_ENTITY);

        // Step 3: Consultant validates and signs — expect 200 AWAITING_CLIENT_SIGNATURE
        Map<String, Object> validateBody = Map.of(
                "providerSignatureDate", "2026-07-31",
                "providerSignatureImage", MIN_PNG,
                "providerSignerName", "Test Provider");
        ResponseEntity<Map<String, Object>> validateResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/validate",
                HttpMethod.POST,
                new HttpEntity<>(validateBody),
                new ParameterizedTypeReference<>() {});

        assertThat(validateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(validateResponse.getBody()).isNotNull();
        assertThat(validateResponse.getBody().get("status")).isEqualTo("AWAITING_CLIENT_SIGNATURE");

        // Day update rejected after consultant signed (409)
        ResponseEntity<Map<String, Object>> dayUpdateRejected = restTemplate.exchange(
                "/api/cras/" + craId + "/days/2026-07-01",
                HttpMethod.PATCH,
                new HttpEntity<>(dayBody),
                new ParameterizedTypeReference<>() {});
        assertThat(dayUpdateRejected.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);

        // PDF allowed for AWAITING_CLIENT_SIGNATURE (200)
        ResponseEntity<byte[]> pdfSignedResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null, byte[].class);
        assertThat(pdfSignedResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(pdfSignedResponse.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(pdfSignedResponse.getBody()).isNotEmpty();

        // Step 4: Generate signature link — requires AWAITING_CLIENT_SIGNATURE
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

        // Step 5: Client signs — AWAITING_CLIENT_SIGNATURE → VALIDATED
        Map<String, Object> clientSignBody = Map.of(
                "signerName", "Alice Client",
                "signerRole", "Responsable technique",
                "consentApproved", true,
                "signatureImageBase64", MIN_PNG);

        ResponseEntity<Void> clientSignResponse = restTemplate.exchange(
                "/public/cra-link/" + rawToken + "/sign",
                HttpMethod.POST,
                new HttpEntity<>(clientSignBody),
                Void.class);

        assertThat(clientSignResponse.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Step 6: List history — expect CRA now in VALIDATED status
        ResponseEntity<List<Map<String, Object>>> historyResponse = restTemplate.exchange(
                "/api/cras", HttpMethod.GET, null,
                new ParameterizedTypeReference<>() {});

        assertThat(historyResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, Object>> history = historyResponse.getBody();
        assertThat(history).isNotNull().isNotEmpty();
        Map<String, Object> validatedCra = history.stream()
                .filter(item -> craId.equals(((Number) item.get("id")).longValue()))
                .findFirst()
                .orElseThrow(() -> new AssertionError("CRA not found in history"));
        assertThat(validatedCra.get("status")).isEqualTo("VALIDATED");

        // Step 7: Download PDF for VALIDATED CRA — expect 200 application/pdf
        ResponseEntity<byte[]> pdfResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null, byte[].class);

        assertThat(pdfResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(pdfResponse.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(pdfResponse.getBody()).isNotEmpty();
    }
}
