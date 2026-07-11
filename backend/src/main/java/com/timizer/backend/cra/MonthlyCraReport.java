package com.timizer.backend.cra;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
    name = "monthly_cra_report",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_monthly_cra_report_period",
        columnNames = {"month", "year"}
    )
)
public class MonthlyCraReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Min(1)
    @Max(12)
    @Column(name = "month", nullable = false)
    private int month;

    @Min(2000)
    @Column(name = "year", nullable = false)
    private int year;

    @NotBlank
    @Column(name = "provider_first_name", nullable = false)
    private String providerFirstName;

    @NotBlank
    @Column(name = "provider_last_name", nullable = false)
    private String providerLastName;

    @NotBlank
    @Column(name = "provider_company", nullable = false)
    private String providerCompany;

    @NotBlank
    @Column(name = "client_first_name", nullable = false)
    private String clientFirstName;

    @NotBlank
    @Column(name = "client_last_name", nullable = false)
    private String clientLastName;

    @NotBlank
    @Column(name = "client_company", nullable = false)
    private String clientCompany;

    @Email
    @NotBlank
    @Column(name = "client_contact_email", nullable = false)
    private String clientContactEmail;

    @Column(name = "client_contact_phone")
    private String clientContactPhone;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private ValidationStatus status = ValidationStatus.DRAFT;

    @Column(name = "provider_signature_date")
    private LocalDate providerSignatureDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected MonthlyCraReport() {
    }

    MonthlyCraReport(
        int month,
        int year,
        String providerFirstName,
        String providerLastName,
        String providerCompany,
        String clientFirstName,
        String clientLastName,
        String clientCompany,
        String clientContactEmail,
        String clientContactPhone
    ) {
        this.month = month;
        this.year = year;
        this.providerFirstName = providerFirstName;
        this.providerLastName = providerLastName;
        this.providerCompany = providerCompany;
        this.clientFirstName = clientFirstName;
        this.clientLastName = clientLastName;
        this.clientCompany = clientCompany;
        this.clientContactEmail = clientContactEmail;
        this.clientContactPhone = clientContactPhone;
        this.status = ValidationStatus.DRAFT;
    }

    @PrePersist
    void onPrePersist() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) {
            this.status = ValidationStatus.DRAFT;
        }
    }

    @PreUpdate
    void onPreUpdate() {
        this.updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public int getMonth() {
        return month;
    }

    public int getYear() {
        return year;
    }

    public String getProviderFirstName() {
        return providerFirstName;
    }

    public String getProviderLastName() {
        return providerLastName;
    }

    public String getProviderCompany() {
        return providerCompany;
    }

    public String getClientFirstName() {
        return clientFirstName;
    }

    public String getClientLastName() {
        return clientLastName;
    }

    public String getClientCompany() {
        return clientCompany;
    }

    public String getClientContactEmail() {
        return clientContactEmail;
    }

    public String getClientContactPhone() {
        return clientContactPhone;
    }

    public ValidationStatus getStatus() {
        return status;
    }

    public LocalDate getProviderSignatureDate() {
        return providerSignatureDate;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setStatus(ValidationStatus status) {
        this.status = status;
    }

    public void setProviderSignatureDate(LocalDate providerSignatureDate) {
        this.providerSignatureDate = providerSignatureDate;
    }

    public void setClientFirstName(String clientFirstName) {
        this.clientFirstName = clientFirstName;
    }

    public void setClientLastName(String clientLastName) {
        this.clientLastName = clientLastName;
    }

    public void setClientCompany(String clientCompany) {
        this.clientCompany = clientCompany;
    }

    public void setClientContactEmail(String clientContactEmail) {
        this.clientContactEmail = clientContactEmail;
    }

    public void setClientContactPhone(String clientContactPhone) {
        this.clientContactPhone = clientContactPhone;
    }

    public void setProviderFirstName(String providerFirstName) {
        this.providerFirstName = providerFirstName;
    }

    public void setProviderLastName(String providerLastName) {
        this.providerLastName = providerLastName;
    }

    public void setProviderCompany(String providerCompany) {
        this.providerCompany = providerCompany;
    }
}
