package com.timizerlike.backend.settings;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "client_settings")
public class ClientSettings {

    @Id
    private Long id = 1L;

    @Column(name = "client_company", nullable = false)
    private String clientCompany;

    @Column(name = "client_address", nullable = false)
    private String clientAddress;

    @Column(name = "contact_full_name", nullable = false)
    private String contactFullName;

    @Column(name = "contact_role", nullable = false)
    private String contactRole;

    @Column(name = "contact_email", nullable = false)
    private String contactEmail;

    protected ClientSettings() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClientCompany() {
        return clientCompany;
    }

    public void setClientCompany(String clientCompany) {
        this.clientCompany = clientCompany;
    }

    public String getClientAddress() {
        return clientAddress;
    }

    public void setClientAddress(String clientAddress) {
        this.clientAddress = clientAddress;
    }

    public String getContactFullName() {
        return contactFullName;
    }

    public void setContactFullName(String contactFullName) {
        this.contactFullName = contactFullName;
    }

    public String getContactRole() {
        return contactRole;
    }

    public void setContactRole(String contactRole) {
        this.contactRole = contactRole;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }
}
