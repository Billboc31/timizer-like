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

        // Step 3: Validate the CRA — expect 200 VALIDATED
        Map<String, Object> validateBody = Map.of("providerSignatureDate", "2026-07-31");
        ResponseEntity<Map<String, Object>> validateResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/validate",
                HttpMethod.POST,
                new HttpEntity<>(validateBody),
                new ParameterizedTypeReference<>() {});

        assertThat(validateResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(validateResponse.getBody()).isNotNull();
        assertThat(validateResponse.getBody().get("status")).isEqualTo("VALIDATED");

        // Step 4: List history — expect 200 and list contains the CRA id
        ResponseEntity<List<Map<String, Object>>> historyResponse = restTemplate.exchange(
                "/api/cras", HttpMethod.GET, null,
                new ParameterizedTypeReference<>() {});

        assertThat(historyResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        List<Map<String, Object>> history = historyResponse.getBody();
        assertThat(history).isNotNull().isNotEmpty();
        boolean found = history.stream()
                .anyMatch(item -> craId.equals(((Number) item.get("id")).longValue()));
        assertThat(found).isTrue();

        // Step 5: Download PDF — expect 200 application/pdf with non-empty body
        ResponseEntity<byte[]> pdfResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/pdf", HttpMethod.GET, null, byte[].class);

        assertThat(pdfResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(pdfResponse.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(pdfResponse.getBody()).isNotEmpty();
    }
}
