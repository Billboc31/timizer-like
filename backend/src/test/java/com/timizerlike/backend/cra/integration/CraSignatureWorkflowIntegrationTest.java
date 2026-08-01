package com.timizerlike.backend.cra.integration;

import static org.assertj.core.api.Assertions.assertThat;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

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
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;

import com.timizer.backend.cra.CraSignatureToken;
import com.timizer.backend.cra.CraSignatureTokenRepository;
import com.timizerlike.cra.TimizerLikeApplication;

@SpringBootTest(classes = TimizerLikeApplication.class, webEnvironment = WebEnvironment.RANDOM_PORT,
        properties = "timizer.public-frontend-base-url=https://timizer.example.com")
class CraSignatureWorkflowIntegrationTest {

    private static final String MIN_PNG =
            "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private CraSignatureTokenRepository tokenRepository;

    @BeforeEach
    void setUp() {
        restTemplate.getRestTemplate().setRequestFactory(
                new HttpComponentsClientHttpRequestFactory(HttpClients.createDefault()));
    }

    private Long createDraftCra(int month) {
        Map<String, Object> createBody = Map.of("year", 2026, "month", month);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                "/api/cra", HttpMethod.POST,
                new HttpEntity<>(createBody),
                new ParameterizedTypeReference<>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        return ((Number) response.getBody().get("id")).longValue();
    }

    private void consultantValidate(Long craId) {
        Map<String, Object> validateBody = Map.of(
                "providerSignatureDate", "2026-08-31",
                "providerSignatureImage", MIN_PNG,
                "providerSignerName", "Test Provider");
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                "/api/cras/" + craId + "/validate",
                HttpMethod.POST,
                new HttpEntity<>(validateBody),
                new ParameterizedTypeReference<>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("status")).isEqualTo("AWAITING_CLIENT_SIGNATURE");
    }

    private String clientSign(Long craId) {
        ResponseEntity<Map<String, Object>> linkResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/signature-link",
                HttpMethod.POST,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {});
        assertThat(linkResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String signatureUrl = (String) linkResponse.getBody().get("signatureUrl");
        String rawToken = signatureUrl.substring(signatureUrl.lastIndexOf('/') + 1);

        Map<String, Object> clientSignBody = Map.of(
                "signerName", "Bob Client",
                "signerRole", "Manager",
                "consentApproved", true,
                "signatureImageBase64", MIN_PNG);

        ResponseEntity<Map<String, Object>> clientSignResponse = restTemplate.exchange(
                "/public/cra-link/" + rawToken + "/sign",
                HttpMethod.POST,
                new HttpEntity<>(clientSignBody),
                new ParameterizedTypeReference<>() {});

        assertThat(clientSignResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(clientSignResponse.getBody()).isNotNull();
        String downloadToken = (String) clientSignResponse.getBody().get("downloadToken");
        assertThat(downloadToken).isNotBlank();
        return rawToken;
    }

    private static String sha256(String input) {
        try {
            MessageDigest md = MessageDigest.getInstance("SHA-256");
            byte[] hash = md.digest(input.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder(64);
            for (byte b : hash) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }

    @Test
    void generatedLinkUrlHasConfiguredBasePrefix() {
        Long craId = createDraftCra(12);
        consultantValidate(craId);

        ResponseEntity<Map<String, Object>> linkResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/signature-link",
                HttpMethod.POST,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {});
        assertThat(linkResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(linkResponse.getBody()).isNotNull();
        String signatureUrl = (String) linkResponse.getBody().get("signatureUrl");
        assertThat(signatureUrl).startsWith("https://timizer.example.com/sign/");

        String rawToken = signatureUrl.substring(signatureUrl.lastIndexOf('/') + 1);
        ResponseEntity<Map<String, Object>> publicView = restTemplate.exchange(
                "/public/cra-link/" + rawToken,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});
        assertThat(publicView.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(publicView.getBody()).isNotNull();
        assertThat(publicView.getBody().get("status")).isEqualTo("AWAITING_CLIENT_SIGNATURE");
    }

    @Test
    void tokenGenerationRequiresAwaitingClientSignatureState() {
        Long craId = createDraftCra(8);

        // Token generation fails while CRA is still DRAFT
        ResponseEntity<Map<String, Object>> linkOnDraft = restTemplate.exchange(
                "/api/cras/" + craId + "/signature-link",
                HttpMethod.POST,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {});
        assertThat(linkOnDraft.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(linkOnDraft.getBody()).isNotNull();
        assertThat(linkOnDraft.getBody().get("error")).isEqualTo("invalid_cra_transition");

        // After consultant validates, token generation succeeds
        consultantValidate(craId);

        ResponseEntity<Map<String, Object>> linkAfterValidate = restTemplate.exchange(
                "/api/cras/" + craId + "/signature-link",
                HttpMethod.POST,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {});
        assertThat(linkAfterValidate.getStatusCode()).isEqualTo(HttpStatus.CREATED);
    }

    @Test
    void duplicateConsultantValidationIsRejected() {
        Long craId = createDraftCra(9);

        consultantValidate(craId);

        // Second validate call on non-DRAFT CRA returns 409
        Map<String, Object> validateBody = Map.of(
                "providerSignatureDate", "2026-09-30",
                "providerSignatureImage", MIN_PNG,
                "providerSignerName", "Test Provider");
        ResponseEntity<Map<String, Object>> duplicate = restTemplate.exchange(
                "/api/cras/" + craId + "/validate",
                HttpMethod.POST,
                new HttpEntity<>(validateBody),
                new ParameterizedTypeReference<>() {});
        assertThat(duplicate.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
        assertThat(duplicate.getBody()).isNotNull();
        assertThat(duplicate.getBody().get("error")).isEqualTo("cra_validated");
    }

    @Test
    void reSigningWithConsumedTokenReturns410() {
        Long craId = createDraftCra(10);

        consultantValidate(craId);

        // Generate token
        ResponseEntity<Map<String, Object>> linkResponse = restTemplate.exchange(
                "/api/cras/" + craId + "/signature-link",
                HttpMethod.POST,
                new HttpEntity<>(null),
                new ParameterizedTypeReference<>() {});
        assertThat(linkResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        String signatureUrl = (String) linkResponse.getBody().get("signatureUrl");
        String rawToken = signatureUrl.substring(signatureUrl.lastIndexOf('/') + 1);

        Map<String, Object> clientSignBody = Map.of(
                "signerName", "Bob Client",
                "signerRole", "Manager",
                "consentApproved", true,
                "signatureImageBase64", MIN_PNG);

        // First sign succeeds
        ResponseEntity<Void> firstSign = restTemplate.exchange(
                "/public/cra-link/" + rawToken + "/sign",
                HttpMethod.POST,
                new HttpEntity<>(clientSignBody),
                Void.class);
        assertThat(firstSign.getStatusCode()).isEqualTo(HttpStatus.OK);

        // Re-signing with consumed token returns 410 GONE
        ResponseEntity<Map<String, Object>> reSign = restTemplate.exchange(
                "/public/cra-link/" + rawToken + "/sign",
                HttpMethod.POST,
                new HttpEntity<>(clientSignBody),
                new ParameterizedTypeReference<>() {});
        assertThat(reSign.getStatusCode()).isEqualTo(HttpStatus.GONE);
        assertThat(reSign.getBody()).isNotNull();
        assertThat(reSign.getBody().get("error")).isEqualTo("token_already_consumed");
    }

    @Test
    void dayUpdateRejectedAfterConsultantValidation() {
        Long craId = createDraftCra(11);

        // Day update works while DRAFT
        Map<String, Object> dayBody = Map.of("workValue", 1.0);
        ResponseEntity<Map<String, Object>> dayOk = restTemplate.exchange(
                "/api/cras/" + craId + "/days/2026-11-03",
                HttpMethod.PATCH,
                new HttpEntity<>(dayBody),
                new ParameterizedTypeReference<>() {});
        assertThat(dayOk.getStatusCode()).isEqualTo(HttpStatus.OK);

        consultantValidate(craId);

        // Day update rejected after validate (409)
        ResponseEntity<Map<String, Object>> dayRejected = restTemplate.exchange(
                "/api/cras/" + craId + "/days/2026-11-03",
                HttpMethod.PATCH,
                new HttpEntity<>(dayBody),
                new ParameterizedTypeReference<>() {});
        assertThat(dayRejected.getStatusCode()).isEqualTo(HttpStatus.CONFLICT);
    }

    @Test
    void clientCannotSignWithoutValidToken() {
        Map<String, Object> clientSignBody = Map.of(
                "signerName", "Bob Client",
                "signerRole", "Manager",
                "consentApproved", true,
                "signatureImageBase64", MIN_PNG);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                "/public/cra-link/no-such-token/sign",
                HttpMethod.POST,
                new HttpEntity<>(clientSignBody),
                new ParameterizedTypeReference<>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("error")).isEqualTo("token_invalid");
    }

    @Test
    void reopenAfterConsultantSignatureReturnsToDraft() {
        Long craId = createDraftCra(1);
        consultantValidate(craId);

        ResponseEntity<Void> reopen = restTemplate.exchange(
                "/api/cras/" + craId + "/reopen",
                HttpMethod.POST,
                new HttpEntity<>(null),
                Void.class);
        assertThat(reopen.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<Map<String, Object>> cra = restTemplate.exchange(
                "/api/cras/" + craId,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});
        assertThat(cra.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(cra.getBody()).isNotNull();
        assertThat(cra.getBody().get("status")).isEqualTo("DRAFT");
    }

    @Test
    void reopenAfterBothSignaturesReturnsToDraft() {
        Long craId = createDraftCra(2);
        consultantValidate(craId);
        clientSign(craId);

        ResponseEntity<Void> reopen = restTemplate.exchange(
                "/api/cras/" + craId + "/reopen",
                HttpMethod.POST,
                new HttpEntity<>(null),
                Void.class);
        assertThat(reopen.getStatusCode()).isEqualTo(HttpStatus.NO_CONTENT);

        ResponseEntity<Map<String, Object>> cra = restTemplate.exchange(
                "/api/cras/" + craId,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});
        assertThat(cra.getBody()).isNotNull();
        assertThat(cra.getBody().get("status")).isEqualTo("DRAFT");
    }

    @Test
    void expiredSignatureLinkReturns410() {
        Long craId = createDraftCra(3);
        consultantValidate(craId);

        // Insert an expired token directly
        String rawToken = "integration-test-expired-token";
        tokenRepository.save(new CraSignatureToken(sha256(rawToken), craId, Instant.now().minusSeconds(3600)));

        Map<String, Object> clientSignBody = Map.of(
                "signerName", "Bob Client",
                "signerRole", "Manager",
                "consentApproved", true,
                "signatureImageBase64", MIN_PNG);
        ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                "/public/cra-link/" + rawToken + "/sign",
                HttpMethod.POST,
                new HttpEntity<>(clientSignBody),
                new ParameterizedTypeReference<>() {});
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.GONE);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().get("error")).isEqualTo("token_expired");
    }

    @Test
    void concurrentConsultantValidationsProduceAtMostOneSuccess() throws InterruptedException {
        Long craId = createDraftCra(4);

        Map<String, Object> validateBody = Map.of(
                "providerSignatureDate", "2026-04-30",
                "providerSignatureImage", MIN_PNG,
                "providerSignerName", "Test Provider");

        CountDownLatch startLatch = new CountDownLatch(1);
        CountDownLatch doneLatch = new CountDownLatch(2);
        AtomicInteger successCount = new AtomicInteger(0);

        Runnable task = () -> {
            try {
                startLatch.await();
                ResponseEntity<Map<String, Object>> response = restTemplate.exchange(
                        "/api/cras/" + craId + "/validate",
                        HttpMethod.POST,
                        new HttpEntity<>(validateBody),
                        new ParameterizedTypeReference<>() {});
                if (response.getStatusCode() == HttpStatus.OK) {
                    successCount.incrementAndGet();
                }
            } catch (Exception ignored) {
                // any exception counts as failure — do not increment
            } finally {
                doneLatch.countDown();
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        startLatch.countDown();
        doneLatch.await(10, TimeUnit.SECONDS);

        assertThat(successCount.get()).isLessThanOrEqualTo(1);

        // Verify the CRA reached a consistent state
        ResponseEntity<Map<String, Object>> cra = restTemplate.exchange(
                "/api/cras/" + craId,
                HttpMethod.GET,
                null,
                new ParameterizedTypeReference<>() {});
        assertThat(cra.getStatusCode()).isEqualTo(HttpStatus.OK);
    }
}
