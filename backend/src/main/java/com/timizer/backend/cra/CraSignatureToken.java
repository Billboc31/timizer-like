package com.timizer.backend.cra;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

@Entity
@Table(name = "cra_signature_token")
public class CraSignatureToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "token_hash", nullable = false, unique = true)
    private String tokenHash;

    @Column(name = "cra_id", nullable = false)
    private Long craId;

    @Column(name = "revoked_at")
    private Instant revokedAt;

    @Column(name = "consumed_at")
    private Instant consumedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expires_at")
    private Instant expiresAt;

    protected CraSignatureToken() {
    }

    public CraSignatureToken(String tokenHash, Long craId) {
        this.tokenHash = tokenHash;
        this.craId = craId;
    }

    public CraSignatureToken(String tokenHash, Long craId, Instant expiresAt) {
        this.tokenHash = tokenHash;
        this.craId = craId;
        this.expiresAt = expiresAt;
    }

    @PrePersist
    void onPrePersist() {
        this.createdAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public String getTokenHash() {
        return tokenHash;
    }

    public Long getCraId() {
        return craId;
    }

    public Instant getRevokedAt() {
        return revokedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public boolean isRevoked() {
        return this.revokedAt != null;
    }

    public boolean isConsumed() {
        return this.consumedAt != null;
    }

    public boolean isExpired() {
        return this.expiresAt != null && Instant.now().isAfter(this.expiresAt);
    }

    public void consume() {
        this.consumedAt = Instant.now();
    }
}
