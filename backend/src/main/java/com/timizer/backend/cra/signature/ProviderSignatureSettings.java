package com.timizer.backend.cra.signature;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "provider_signature_settings")
public class ProviderSignatureSettings {

    @Id
    private Long id = 1L;

    @Column(name = "signer_name")
    private String signerName;

    @Column(name = "signature_image")
    private String signatureImage;

    protected ProviderSignatureSettings() {
    }

    public ProviderSignatureSettings(String signerName, String signatureImage) {
        this.id = 1L;
        this.signerName = signerName;
        this.signatureImage = signatureImage;
    }

    public Long getId() {
        return id;
    }

    public String getSignerName() {
        return signerName;
    }

    public String getSignatureImage() {
        return signatureImage;
    }

    public void setSignerName(String signerName) {
        this.signerName = signerName;
    }

    public void setSignatureImage(String signatureImage) {
        this.signatureImage = signatureImage;
    }
}
