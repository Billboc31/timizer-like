package com.timizer.backend.cra;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.Table;

@Entity
@Table(name = "cra_client_signature_record")
public class CraClientSignatureRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cra_id", nullable = false)
    private Long craId;

    @Column(name = "token_id", nullable = false)
    private Long tokenId;

    @Column(name = "signer_name", nullable = false)
    private String signerName;

    @Column(name = "signer_role")
    private String signerRole;

    @Column(name = "consent_approved", nullable = false)
    private boolean consentApproved;

    @Lob
    @Column(name = "signature_image_base64", nullable = false)
    private String signatureImageBase64;

    @Lob
    @Column(name = "cra_content_snapshot", nullable = false)
    private String craContentSnapshot;

    @Column(name = "signed_at", nullable = false)
    private Instant signedAt;

    protected CraClientSignatureRecord() {
    }

    public CraClientSignatureRecord(
            Long craId,
            Long tokenId,
            String signerName,
            String signerRole,
            boolean consentApproved,
            String signatureImageBase64,
            String craContentSnapshot,
            Instant signedAt) {
        this.craId = craId;
        this.tokenId = tokenId;
        this.signerName = signerName;
        this.signerRole = signerRole;
        this.consentApproved = consentApproved;
        this.signatureImageBase64 = signatureImageBase64;
        this.craContentSnapshot = craContentSnapshot;
        this.signedAt = signedAt;
    }

    public Long getId() { return id; }
    public Long getCraId() { return craId; }
    public Long getTokenId() { return tokenId; }
    public String getSignerName() { return signerName; }
    public String getSignerRole() { return signerRole; }
    public boolean isConsentApproved() { return consentApproved; }
    public String getSignatureImageBase64() { return signatureImageBase64; }
    public String getCraContentSnapshot() { return craContentSnapshot; }
    public Instant getSignedAt() { return signedAt; }
}
