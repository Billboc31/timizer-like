package com.timizerlike.backend.provider;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Entity
@Table(name = "provider_settings")
public class ProviderSettings {

    @Id
    private Long id;

    @NotBlank
    @Column(name = "raison_sociale")
    private String raisonSociale;

    @Pattern(regexp = "^\\d{14}$")
    @Column(name = "siret")
    private String siret;

    @Column(name = "adresse")
    private String adresse;

    @Column(name = "code_postal")
    private String codePostal;

    @Column(name = "ville")
    private String ville;

    @Column(name = "pays")
    private String pays;

    protected ProviderSettings() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getRaisonSociale() { return raisonSociale; }
    public void setRaisonSociale(String raisonSociale) { this.raisonSociale = raisonSociale; }
    public String getSiret() { return siret; }
    public void setSiret(String siret) { this.siret = siret; }
    public String getAdresse() { return adresse; }
    public void setAdresse(String adresse) { this.adresse = adresse; }
    public String getCodePostal() { return codePostal; }
    public void setCodePostal(String codePostal) { this.codePostal = codePostal; }
    public String getVille() { return ville; }
    public void setVille(String ville) { this.ville = ville; }
    public String getPays() { return pays; }
    public void setPays(String pays) { this.pays = pays; }
}
