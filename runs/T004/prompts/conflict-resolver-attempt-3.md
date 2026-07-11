# GLOBAL CONTEXT

# Global Context — Timizer Like

## Project

- project_id: timizer-like
- repo: git@github.com:Billboc31/timizer-like.git

## AI Dev Factory

This project uses AI Dev Factory for AI-assisted development.

Agent context folders:
- `ai/` — roles and skills
- `docs/` — project documentation
- `prompts/` — ticket-specific and generic prompts
- `runs/` — per-ticket runtime artifacts
- `tickets/` — ticket definitions

---

# ROLE

# Role — Conflict Resolver

## Mission

Resolve Git merge conflicts in the current ticket worktree by editing conflicted files in-place, preserving both the ticket intent and the latest main branch behavior.

## Tu dois

- lire le fichier `conflict/context.md` qui contient le ticket, le plan, les reviews, le diff PR, les fichiers en conflit et les derniers commits de main
- éditer chaque fichier en conflit pour supprimer les marqueurs de conflit (`<<<<<<<`, `=======`, `>>>>>>>`)
- résoudre chaque conflit de façon raisonnée en conservant l'intent du ticket ET le comportement de main
- écrire un résumé de chaque décision de résolution dans ton output (qui deviendra `conflict/resolution.md`)
- signaler toute incertitude ou limitation

## Tu ne dois pas

- choisir aveuglément `ours` ou `theirs` sans justification
- faire de reset de branche
- merger vers main
- ignorer les fichiers en conflit
- masquer les erreurs ou incertitudes
- modifier des fichiers hors scope de la résolution

## Sortie attendue

La sortie (stdout) doit être `conflict/resolution.md` contenant :
- liste des fichiers résolus avec la décision prise pour chaque conflit
- justification de chaque choix (ticket vs main)
- hypothèses faites si le conflit était ambigu
- limites connues

## Règles de sécurité

- ne jamais résoudre les conflits sur la branche `main`
- ne jamais faire de `git reset --hard`
- ne jamais auto-merger vers main
- ne pas supprimer du code fonctionnel des deux côtés sans justification explicite
- toujours préserver le comportement attendu du ticket en priorité

---

# SKILL: workflow-discipline

# Skill — Workflow Discipline

## Objectif

Faire respecter le lifecycle officiel des tickets et PR IA.

## Règles

- respecter l’ordre des étapes du workflow
- ne pas bypass les reviews obligatoires
- maintenir les statuts cohérents
- conserver les artefacts versionnés
- séparer plan, implémentation et mémoire

## Refuser si

- une review obligatoire est sautée
- la mémoire est mise à jour avant validation implémentation
- le workflow officiel est contourné

---

# SKILL: git-discipline

# Skill — Git Discipline

## Objectif

Maintenir un historique Git propre, compréhensible et traçable.

## Règles

- un ticket = une unité de travail cohérente
- éviter les commits mélangeant plusieurs sujets
- utiliser des messages de commit explicites
- conserver les PR lisibles
- éviter les modifications hors scope
- maintenir les fichiers mémoire cohérents avec les changements réels

## Refuser si

- la PR mélange plusieurs fonctionnalités
- des changements non liés sont ajoutés
- les commits deviennent impossibles à reviewer

---

# SKILL: code-quality

# Skill — Code Quality

## Objectif

Produire des changements simples, lisibles, robustes et faciles à reviewer.

## Règles

- privilégier le code simple avant le code sophistiqué
- utiliser des noms explicites
- garder des fonctions courtes et lisibles
- éviter la magie cachée
- gérer les erreurs explicitement
- ajouter des logs utiles sans bruit excessif
- éviter les dépendances inutiles
- conserver un changement borné au ticket

## Refuser si

- le code devient inutilement complexe
- le ticket introduit une dépendance non justifiée
- les erreurs sont masquées
- les changements dépassent le scope demandé

---

# SKILL: refactor-safety

# Skill — Refactor Safety

## Objectif

Limiter les régressions et les dérives de scope lors des modifications.

## Règles

- modifier uniquement le périmètre demandé
- éviter les refactors transversaux implicites
- préserver les comportements existants
- maintenir la compatibilité sauf demande explicite
- privilégier des changements incrémentaux

## Refuser si

- le ticket dérive vers une réécriture globale
- plusieurs couches sont modifiées sans justification
- le comportement change silencieusement

---

# TASK

# Generic Conflict Resolver Task

Read `conflict/context.md` in the run directory. It contains the full ticket context, plan, reviews, PR diff, conflicted files (with conflict markers), and the latest commits on main.

Your task:
1. Edit every conflicted file in-place to remove all conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
2. Resolve each conflict by preserving both the ticket intent and the latest main behavior where possible.
3. Do not blindly pick ours or theirs — reason through each conflict.
4. Write your output (stdout) as `conflict/resolution.md` summarising every conflict decision.

Safety rules:
- Do not reset the branch.
- Do not auto-merge to main.
- Do not blindly choose ours/theirs without justification.
- Preserve both ticket intent and latest main behavior when possible.

The ticket follows.


# Conflict Context — T004

Generated at: 2026-07-11T12:46:15Z

## Metadata

- pre_conflict_state: TEST_COMPLETE
- conflict_detected_at: 2026-07-11T10:35:34Z
- conflict_pr_number: 42
- conflicted_files: backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java, backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java

---

## Ticket

# T004 — Create CRA repository

**Source**: GitHub Issue #7

## Description

## Context

CRA records must be persisted and retrieved from SQLite.

## Goal

Create repository access for monthly CRA records.

## Description

Add backend repository support for saving, retrieving, updating, and listing monthly CRA records with their day entries.

The repository must support lookup by month and year.

## Out of Scope

- REST controllers
- Business services
- PDF generation
- Frontend code
- Authentication
- Client signature

## Acceptance Criteria

- CRA records can be saved
- CRA records can be retrieved by identifier
- CRA records can be retrieved by month and year
- CRA records can be listed for history display
- CRA records can be updated
- Existing tests still pass

---

## Plan

## Objective

Introduce a Spring Data JPA repository for `MonthlyCraReport` so that monthly CRA records — together with their day entries — can be persisted to SQLite, retrieved by identifier or by (month, year), listed for history, and updated. Existing entity behaviour and prior test suites remain intact.

## Included

- Ensure the JPA mapping between `MonthlyCraReport` and its day entries is wired for cascading persistence and retrieval:
  - In `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`, add a `@OneToMany` collection field (e.g. `List<CraDayEntry> dayEntries`) targeting the entity introduced in T003, with `mappedBy = "monthlyCraReport"` (or an owning-side foreign key column, matching the T003 mapping), `cascade = CascadeType.ALL`, `orphanRemoval = true`, and a `FetchType.LAZY` fetch strategy.
  - Provide a small API on `MonthlyCraReport` to attach / detach day entries (`addDayEntry(CraDayEntry)`, `removeDayEntry(CraDayEntry)`) that keeps both sides of the association consistent. No behavioural change beyond wiring.
  - If T003 introduced `CraDayEntry` without a JPA `@Entity` mapping or without a `monthlyCraReport` reference, add the minimal mapping required on that class to make the relationship work (annotations only — no field rename, no validation change, no new business rule).
  - Only touch these two entity files; do not modify unrelated fields, constructors, or validation.
- Create `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java`:
  - Interface extending `org.springframework.data.jpa.repository.JpaRepository<MonthlyCraReport, Long>`.
  - Declared query method `Optional<MonthlyCraReport> findByMonthAndYear(int month, int year)`.
  - Declared query method `List<MonthlyCraReport> findAllByOrderByYearDescMonthDesc()` for history listing (most recent period first).
  - No custom `@Query` unless a derived method cannot express the need.
  - Annotate with `@Repository` for clarity (optional under Spring Data but keeps convention consistent with the existing package).
- Add repository-level tests in `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java` using `@DataJpaTest` and `TestEntityManager` (aligned with `MonthlyCraReportPersistenceTest.java`):
  - Save a report (with at least one attached `CraDayEntry`) and assert that both the parent id and the child entries are persisted after flush + clear + reload.
  - `findById` returns the saved report with its day entries populated.
  - `findByMonthAndYear` returns the report for a matching (month, year) and returns `Optional.empty()` when no match.
  - `findAllByOrderByYearDescMonthDesc` returns multiple saved reports ordered by year desc then month desc.
  - Update path: load a report, mutate a mutable field already exposed on the entity (e.g. `setStatus(ValidationStatus.SUBMITTED)`), save, reload, and assert the change persisted and `updatedAt` advanced.
  - Add or remove a day entry on a persisted report and assert the change is reflected after reload (covers `cascade` and `orphanRemoval`).
  - Reuse the existing `spring.jpa.hibernate.ddl-auto=create-drop` `@TestPropertySource` pattern from `MonthlyCraReportPersistenceTest`.
- Do not introduce a service layer, DTOs, mappers, controllers, or new configuration classes. The repository is consumed directly by future tickets.
- Package remains `com.timizer.backend.cra`. No new sub-package.

## Excluded

- REST controllers, HTTP endpoints, request/response DTOs.
- Business service layer, transactional orchestration beyond what Spring Data provides by default.
- PDF generation, expense handling, client signature workflow.
- Frontend / calendar UI changes.
- Authentication, authorization, security configuration.
- Database migration tooling (Flyway/Liquibase) — schema continues to be produced by JPA `ddl-auto` as in existing tests.
- Any change to the `ValidationStatus` enum, to entity validation constraints, or to the `MonthlyCraReport` constructor signature.
- A dedicated `CraDayEntryRepository` — day entries are managed through the aggregate root via cascade in this ticket.
- Query methods beyond the ones listed above (no pagination, no filtering by status, no search).

## Acceptance criteria

- `MonthlyCraReportRepository` exists in `com.timizer.backend.cra`, extends `JpaRepository<MonthlyCraReport, Long>`, and exposes `findByMonthAndYear(int, int)` and `findAllByOrderByYearDescMonthDesc()`.
- A `MonthlyCraReport` with attached `CraDayEntry` instances can be saved and reloaded, with both the parent id and the day entries persisted.
- Loading a report by identifier returns the same entity with its day entries accessible.
- Looking up a report by month and year returns the persisted instance; a lookup with no match returns `Optional.empty()`.
- Listing all reports returns them ordered by year descending, then month descending.
- Reloading a persisted report, mutating an already-exposed field, and saving results in the change being visible on the next load, with `updatedAt` advanced.
- Adding or removing a day entry on a managed report and saving is reflected on reload (cascade insert / orphan removal).
- New repository tests pass under `@DataJpaTest`.
- The pre-existing backend test suite (including `MonthlyCraReportTest` and `MonthlyCraReportPersistenceTest`) still passes with no regression.
- No files outside `backend/src/main/java/com/timizer/backend/cra/` and `backend/src/test/java/com/timizer/backend/cra/` are modified.

---

## PR Diff (PR #42)

```diff
diff --git a/backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java b/backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java
new file mode 100644
index 0000000..cef36b0
--- /dev/null
+++ b/backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java
@@ -0,0 +1,80 @@
+package com.timizer.backend.cra;
+
+import java.time.LocalDate;
+
+import jakarta.persistence.Column;
+import jakarta.persistence.Entity;
+import jakarta.persistence.FetchType;
+import jakarta.persistence.GeneratedValue;
+import jakarta.persistence.GenerationType;
+import jakarta.persistence.Id;
+import jakarta.persistence.JoinColumn;
+import jakarta.persistence.ManyToOne;
+import jakarta.persistence.Table;
+
+@Entity
+@Table(name = "cra_day_entry")
+public class CraDayEntry {
+
+    @Id
+    @GeneratedValue(strategy = GenerationType.IDENTITY)
+    private Long id;
+
+    @ManyToOne(fetch = FetchType.LAZY, optional = false)
+    @JoinColumn(name = "monthly_cra_report_id", nullable = false)
+    private MonthlyCraReport monthlyCraReport;
+
+    @Column(name = "entry_date", nullable = false)
+    private LocalDate date;
+
+    @Column(name = "work_value", nullable = false)
+    private double workValue;
+
+    @Column(name = "note")
+    private String note;
+
+    protected CraDayEntry() {
+    }
+
+    public CraDayEntry(LocalDate date, double workValue, String note) {
+        this.date = date;
+        this.workValue = workValue;
+        this.note = note;
+    }
+
+    public Long getId() {
+        return id;
+    }
+
+    public MonthlyCraReport getMonthlyCraReport() {
+        return monthlyCraReport;
+    }
+
+    void setMonthlyCraReport(MonthlyCraReport monthlyCraReport) {
+        this.monthlyCraReport = monthlyCraReport;
+    }
+
+    public LocalDate getDate() {
+        return date;
+    }
+
+    public double getWorkValue() {
+        return workValue;
+    }
+
+    public String getNote() {
+        return note;
+    }
+
+    public void setNote(String note) {
+        this.note = note;
+    }
+
+    public void setWorkValue(double workValue) {
+        this.workValue = workValue;
+    }
+
+    public void setDate(LocalDate date) {
+        this.date = date;
+    }
+}
diff --git a/backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java b/backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java
new file mode 100644
index 0000000..5ced601
--- /dev/null
+++ b/backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java
@@ -0,0 +1,267 @@
+package com.timizer.backend.cra;
+
+import java.time.Instant;
+import java.time.LocalDate;
+import java.util.ArrayList;
+import java.util.List;
+
+import jakarta.persistence.CascadeType;
+import jakarta.persistence.Column;
+import jakarta.persistence.Entity;
+import jakarta.persistence.EnumType;
+import jakarta.persistence.Enumerated;
+import jakarta.persistence.FetchType;
+import jakarta.persistence.GeneratedValue;
+import jakarta.persistence.GenerationType;
+import jakarta.persistence.Id;
+import jakarta.persistence.OneToMany;
+import jakarta.persistence.PrePersist;
+import jakarta.persistence.PreUpdate;
+import jakarta.persistence.Table;
+import jakarta.persistence.UniqueConstraint;
+import jakarta.validation.constraints.Email;
+import jakarta.validation.constraints.Max;
+import jakarta.validation.constraints.Min;
+import jakarta.validation.constraints.NotBlank;
+import jakarta.validation.constraints.NotNull;
+
+@Entity
+@Table(
+    name = "monthly_cra_report",
+    uniqueConstraints = @UniqueConstraint(
+        name = "uk_monthly_cra_report_period",
+        columnNames = {"month", "year"}
+    )
+)
+public class MonthlyCraReport {
+
+    @Id
+    @GeneratedValue(strategy = GenerationType.IDENTITY)
+    private Long id;
+
+    @Min(1)
+    @Max(12)
+    @Column(name = "month", nullable = false)
+    private int month;
+
+    @Min(2000)
+    @Column(name = "year", nullable = false)
+    private int year;
+
+    @NotBlank
+    @Column(name = "provider_first_name", nullable = false)
+    private String providerFirstName;
+
+    @NotBlank
+    @Column(name = "provider_last_name", nullable = false)
+    private String providerLastName;
+
+    @NotBlank
+    @Column(name = "provider_company", nullable = false)
+    private String providerCompany;
+
+    @NotBlank
+    @Column(name = "client_first_name", nullable = false)
+    private String clientFirstName;
+
+    @NotBlank
+    @Column(name = "client_last_name", nullable = false)
+    private String clientLastName;
+
+    @NotBlank
+    @Column(name = "client_company", nullable = false)
+    private String clientCompany;
+
+    @Email
+    @NotBlank
+    @Column(name = "client_contact_email", nullable = false)
+    private String clientContactEmail;
+
+    @Column(name = "client_contact_phone")
+    private String clientContactPhone;
+
+    @NotNull
+    @Enumerated(EnumType.STRING)
+    @Column(name = "status", nullable = false)
+    private ValidationStatus status = ValidationStatus.DRAFT;
+
+    @Column(name = "provider_signature_date")
+    private LocalDate providerSignatureDate;
+
+    @Column(name = "created_at", nullable = false, updatable = false)
+    private Instant createdAt;
+
+    @Column(name = "updated_at", nullable = false)
+    private Instant updatedAt;
+
+    @OneToMany(
+        mappedBy = "monthlyCraReport",
+        cascade = CascadeType.ALL,
+        orphanRemoval = true,
+        fetch = FetchType.LAZY
+    )
+    private List<CraDayEntry> dayEntries = new ArrayList<>();
+
+    protected MonthlyCraReport() {
+    }
+
+    MonthlyCraReport(
+        int month,
+        int year,
+        String providerFirstName,
+        String providerLastName,
+        String providerCompany,
+        String clientFirstName,
+        String clientLastName,
+        String clientCompany,
+        String clientContactEmail,
+        String clientContactPhone
+    ) {
+        this.month = month;
+        this.year = year;
+        this.providerFirstName = providerFirstName;
+        this.providerLastName = providerLastName;
+        this.providerCompany = providerCompany;
+        this.clientFirstName = clientFirstName;
+        this.clientLastName = clientLastName;
+        this.clientCompany = clientCompany;
+        this.clientContactEmail = clientContactEmail;
+        this.clientContactPhone = clientContactPhone;
+        this.status = ValidationStatus.DRAFT;
+    }
+
+    @PrePersist
+    void onPrePersist() {
+        Instant now = Instant.now();
+        this.createdAt = now;
+        this.updatedAt = now;
+        if (this.status == null) {
+            this.status = ValidationStatus.DRAFT;
+        }
+    }
+
+    @PreUpdate
+    void onPreUpdate() {
+        this.updatedAt = Instant.now();
+    }
+
+    public Long getId() {
+        return id;
+    }
+
+    public int getMonth() {
+        return month;
+    }
+
+    public int getYear() {
+        return year;
+    }
+
+    public String getProviderFirstName() {
+        return providerFirstName;
+    }
+
+    public String getProviderLastName() {
+        return providerLastName;
+    }
+
+    public String getProviderCompany() {
+        return providerCompany;
+    }
+
+    public String getClientFirstName() {
+        return clientFirstName;
+    }
+
+    public String getClientLastName() {
+        return clientLastName;
+    }
+
+    public String getClientCompany() {
+        return clientCompany;
+    }
+
+    public String getClientContactEmail() {
+        return clientContactEmail;
+    }
+
+    public String getClientContactPhone() {
+        return clientContactPhone;
+    }
+
+    public ValidationStatus getStatus() {
+        return status;
+    }
+
+    public LocalDate getProviderSignatureDate() {
+        return providerSignatureDate;
+    }
+
+    public Instant getCreatedAt() {
+        return createdAt;
+    }
+
+    public Instant getUpdatedAt() {
+        return updatedAt;
+    }
+
+    public List<CraDayEntry> getDayEntries() {
+        return dayEntries;
+    }
+
+    public void addDayEntry(CraDayEntry entry) {
+        if (entry == null) {
+            return;
+        }
+        dayEntries.add(entry);
+        entry.setMonthlyCraReport(this);
+    }
+
+    public void removeDayEntry(CraDayEntry entry) {
+        if (entry == null) {
+            return;
+        }
+        dayEntries.remove(entry);
+        entry.setMonthlyCraReport(null);
+    }
+
+    public void setStatus(ValidationStatus status) {
+        this.status = status;
+    }
+
+    public void setProviderSignatureDate(LocalDate providerSignatureDate) {
+        this.providerSignatureDate = providerSignatureDate;
+    }
+
+    public void setClientFirstName(String clientFirstName) {
+        this.clientFirstName = clientFirstName;
+    }
+
+    public void setClientLastName(String clientLastName) {
+        this.clientLastName = clientLastName;
+    }
+
+    public void setClientCompany(String clientCompany) {
+        this.clientCompany = clientCompany;
+    }
+
+    public void setClientContactEmail(String clientContactEmail) {
+        this.clientContactEmail = clientContactEmail;
+    }
+
+    public void setClientContactPhone(String clientContactPhone) {
+        this.clientContactPhone = clientContactPhone;
+    }
+
+    public void setProviderFirstName(String providerFirstName) {
+        this.providerFirstName = providerFirstName;
+    }
+
+    public void setProviderLastName(String providerLastName) {
+        this.providerLastName = providerLastName;
+    }
+
+    public void setProviderCompany(String providerCompany) {
+        this.providerCompany = providerCompany;
+    }
+}
diff --git a/backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java b/backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java
new file mode 100644
index 0000000..c0afde8
--- /dev/null
+++ b/backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java
@@ -0,0 +1,15 @@
+package com.timizer.backend.cra;
+
+import java.util.List;
+import java.util.Optional;
+
+import org.springframework.data.jpa.repository.JpaRepository;
+import org.springframework.stereotype.Repository;
+
+@Repository
+public interface MonthlyCraReportRepository extends JpaRepository<MonthlyCraReport, Long> {
+
+    Optional<MonthlyCraReport> findByMonthAndYear(int month, int year);
+
+    List<MonthlyCraReport> findAllByOrderByYearDescMonthDesc();
+}
diff --git a/backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java b/backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java
new file mode 100644
index 0000000..fb90ac7
--- /dev/null
+++ b/backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java
@@ -0,0 +1,182 @@
+package com.timizer.backend.cra;
+
+import static org.assertj.core.api.Assertions.assertThat;
+
+import java.time.Instant;
+import java.time.LocalDate;
+import java.util.List;
+import java.util.Optional;
+
+import org.junit.jupiter.api.Test;
+import org.springframework.beans.factory.annotation.Autowired;
+import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
+import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
+import org.springframework.test.context.TestPropertySource;
+
+@DataJpaTest
+@TestPropertySource(properties = {
+    "spring.jpa.hibernate.ddl-auto=create-drop"
+})
+class MonthlyCraReportRepositoryTest {
+
+    @Autowired
+    private TestEntityManager entityManager;
+
+    @Autowired
+    private MonthlyCraReportRepository repository;
+
+    private static MonthlyCraReport newReport(int month, int year) {
+        return new MonthlyCraReport(
+            month,
+            year,
+            "Alice",
+            "Provider",
+            "Provider Co.",
+            "Bob",
+            "Client",
+            "Client Co.",
+            "bob.client@example.com",
+            "+33123456789"
+        );
+    }
+
+    private static CraDayEntry newDayEntry(int year, int month, int day, double workValue) {
+        return new CraDayEntry(LocalDate.of(year, month, day), workValue, null);
+    }
+
+    @Test
+    void savesReportWithDayEntriesAndAssignsIdentifiers() {
+        MonthlyCraReport report = newReport(6, 2026);
+        report.addDayEntry(newDayEntry(2026, 6, 1, 1.0));
+        report.addDayEntry(newDayEntry(2026, 6, 2, 0.5));
+
+        MonthlyCraReport saved = repository.save(report);
+        entityManager.flush();
+        entityManager.clear();
+
+        assertThat(saved.getId()).isNotNull();
+
+        MonthlyCraReport reloaded = repository.findById(saved.getId()).orElseThrow();
+        assertThat(reloaded.getDayEntries()).hasSize(2);
+        assertThat(reloaded.getDayEntries())
+            .allSatisfy(entry -> assertThat(entry.getId()).isNotNull())
+            .allSatisfy(entry -> assertThat(entry.getMonthlyCraReport().getId())
+                .isEqualTo(reloaded.getId()));
+    }
+
+    @Test
+    void findByIdReturnsReportWithDayEntries() {
+        MonthlyCraReport report = newReport(7, 2026);
+        report.addDayEntry(newDayEntry(2026, 7, 3, 1.0));
+        MonthlyCraReport saved = repository.save(report);
+        entityManager.flush();
+        entityManager.clear();
+
+        Optional<MonthlyCraReport> found = repository.findById(saved.getId());
+
+        assertThat(found).isPresent();
+        assertThat(found.get().getDayEntries())
+            .extracting(CraDayEntry::getDate)
+            .containsExactly(LocalDate.of(2026, 7, 3));
+    }
+
+    @Test
+    void findByMonthAndYearReturnsMatchingReport() {
+        MonthlyCraReport report = newReport(8, 2026);
+        repository.save(report);
+        entityManager.flush();
+        entityManager.clear();
+
+        Optional<MonthlyCraReport> found = repository.findByMonthAndYear(8, 2026);
+
+        assertThat(found).isPresent();
+        assertThat(found.get().getMonth()).isEqualTo(8);
+        assertThat(found.get().getYear()).isEqualTo(2026);
+    }
+
+    @Test
+    void findByMonthAndYearReturnsEmptyWhenNoMatch() {
+        Optional<MonthlyCraReport> found = repository.findByMonthAndYear(1, 2099);
+
+        assertThat(found).isEmpty();
+    }
+
+    @Test
+    void findAllByOrderByYearDescMonthDescReturnsReportsInDescendingPeriodOrder() {
+        repository.save(newReport(3, 2025));
+        repository.save(newReport(11, 2026));
+        repository.save(newReport(2, 2026));
+        entityManager.flush();
+        entityManager.clear();
+
+        List<MonthlyCraReport> reports = repository.findAllByOrderByYearDescMonthDesc();
+
+        assertThat(reports)
+            .extracting(r -> r.getYear() * 100 + r.getMonth())
+            .containsExactly(
+                2026 * 100 + 11,
+                2026 * 100 + 2,
+                2025 * 100 + 3
+            );
+    }
+
+    @Test
+    void updatingReportPersistsChangeAndAdvancesUpdatedAt() throws InterruptedException {
+        MonthlyCraReport report = newReport(9, 2026);
+        MonthlyCraReport saved = repository.save(report);
+        entityManager.flush();
+        Instant originalUpdatedAt = saved.getUpdatedAt();
+        entityManager.clear();
+
+        Thread.sleep(10);
+
+        MonthlyCraReport loaded = repository.findById(saved.getId()).orElseThrow();
+        loaded.setStatus(ValidationStatus.SIGNED_BY_PROVIDER);
+        repository.save(loaded);
+        entityManager.flush();
+        entityManager.clear();
+
+        MonthlyCraReport reloaded = repository.findById(saved.getId()).orElseThrow();
+        assertThat(reloaded.getStatus()).isEqualTo(ValidationStatus.SIGNED_BY_PROVIDER);
+        assertThat(reloaded.getUpdatedAt()).isAfter(originalUpdatedAt);
+    }
+
+    @Test
+    void addingDayEntryToPersistedReportIsCascadedOnSave() {
+        MonthlyCraReport report = newReport(10, 2026);
+        MonthlyCraReport saved = repository.save(report);
+        entityManager.flush();
+        entityManager.clear();
+
+        MonthlyCraReport loaded = repository.findById(saved.getId()).orElseThrow();
+        loaded.addDayEntry(newDayEntry(2026, 10, 5, 1.0));
+        repository.save(loaded);
+        entityManager.flush();
+        entityManager.clear();
+
+        MonthlyCraReport reloaded = repository.findById(saved.getId()).orElseThrow();
+        assertThat(reloaded.getDayEntries()).hasSize(1);
+        assertThat(reloaded.getDayEntries().get(0).getId()).isNotNull();
+    }
+
+    @Test
+    void removingDayEntryFromPersistedReportTriggersOrphanRemoval() {
+        MonthlyCraReport report = newReport(11, 2026);
+        report.addDayEntry(newDayEntry(2026, 11, 1, 1.0));
+        report.addDayEntry(newDayEntry(2026, 11, 2, 0.5));
+        MonthlyCraReport saved = repository.save(report);
+        entityManager.flush();
+        entityManager.clear();
+
+        MonthlyCraReport loaded = repository.findById(saved.getId()).orElseThrow();
+        assertThat(loaded.getDayEntries()).hasSize(2);
+        CraDayEntry toRemove = loaded.getDayEntries().get(0);
+        loaded.removeDayEntry(toRemove);
+        repository.save(loaded);
+        entityManager.flush();
+        entityManager.clear();
+
+        MonthlyCraReport reloaded = repository.findById(saved.getId()).orElseThrow();
+        assertThat(reloaded.getDayEntries()).hasSize(1);
+    }
+}
diff --git a/runs/T004/daemon.lock b/runs/T004/daemon.lock
new file mode 100644
index 0000000..dfd8f79
--- /dev/null
+++ b/runs/T004/daemon.lock
@@ -0,0 +1 @@
+{"pid": 35532, "created_at": "2026-07-11T10:31:31Z"}
\ No newline at end of file
diff --git a/runs/T004/implementation-output.md b/runs/T004/implementation-output.md
new file mode 100644
index 0000000..8fa17a4
--- /dev/null
+++ b/runs/T004/implementation-output.md
@@ -0,0 +1,29 @@
+All four files created. Here is the implementation summary.
+
+## Summary of changes
+
+Implemented the T004 `MonthlyCraReportRepository` per the approved plan. The T004 branch was cut from the shared bootstrap commit and, following the same "isolated ticket-branch" convention used by T002/T005, the source files are written to compile once T002 (`MonthlyCraReport` base), T003 (`CraDayEntry`), and T009 (backend Maven skeleton) are integrated on top.
+
+### Files created
+
+- `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java` — starts from T002's version and adds only the T004 delta:
+  - `@OneToMany(mappedBy = "monthlyCraReport", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY) private List<CraDayEntry> dayEntries`
+  - `addDayEntry(...)` / `removeDayEntry(...)` helpers keeping both sides of the association consistent
+  - `getDayEntries()` accessor
+  - No change to existing fields, constructor, validation, or lifecycle callbacks
+- `backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java` — minimal JPA-mapped entity holding `id`, `monthlyCraReport` (`@ManyToOne`), `date`, `workValue`, `note`, matching the `mappedBy` on the parent. Fields align with T003's planned shape; per T004 plan, only annotations were added to make persistence work.
+- `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java` — `@Repository` interface extending `JpaRepository<MonthlyCraReport, Long>`, exposing `findByMonthAndYear(int, int)` and `findAllByOrderByYearDescMonthDesc()` as derived queries (no `@Query`).
+- `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java` — `@DataJpaTest` + `TestEntityManager` following the T002 `@TestPropertySource("spring.jpa.hibernate.ddl-auto=create-drop")` pattern. Covers: save with day entries, `findById` returns with entries, `findByMonthAndYear` (match + empty), `findAllByOrderByYearDescMonthDesc` ordering, status update + `updatedAt` advance, cascade insert on `addDayEntry`, orphan removal on `removeDayEntry`.
+
+### Verifications performed
+
+- Files placed under the plan-mandated paths in `com.timizer.backend.cra` (main + test); no files outside that package were touched.
+- Cross-checked each acceptance criterion in `plan.md` against a corresponding test method.
+- Confirmed the plan's example `ValidationStatus.SUBMITTED` does not exist in T002 (values are `DRAFT`, `SIGNED_BY_PROVIDER`, `VALIDATED`) — used `SIGNED_BY_PROVIDER` in the update test.
+
+### Known limits / assumptions
+
+- **Tests not executed on this branch.** T004 was cut from `main`, which does not contain T009's `backend/pom.xml`, T002's base entity, or T003's `CraDayEntry`. There is no Maven wrapper to invoke; `./mvnw test` cannot run here. The code is ready to compile and pass once T002/T003/T009 are integrated (same pattern used explicitly by T002's implementation output).
+- **`MonthlyCraReport.java` full copy.** Because the T004 branch cannot start "from" T002's file, this branch contains the full file (T002 content + T004 additions). Merging with T002 will produce a whole-file conflict resolved by keeping the T004 version.
+- **`CraDayEntry.java` created here.** T003 has only a plan, no code. The entity is written with T003's planned fields (`date`, `workValue`, `note`) plus the JPA back-reference (`monthlyCraReport`) T004 requires. T003's `monthlyCraId` plain-identifier design is subsumed by the `@ManyToOne`; a merge with T003 will need reconciliation (expected — anticipated by the T004 plan clause allowing minimal JPA mapping).
+- No REST controller, service layer, DTO, mapper, `CraDayEntryRepository`, migration tooling, or `pom.xml` change was introduced.
diff --git a/runs/T004/plan.md b/runs/T004/plan.md
new file mode 100644
index 0000000..8459117
--- /dev/null
+++ b/runs/T004/plan.md
@@ -0,0 +1,52 @@
+## Objective
+
+Introduce a Spring Data JPA repository for `MonthlyCraReport` so that monthly CRA records — together with their day entries — can be persisted to SQLite, retrieved by identifier or by (month, year), listed for history, and updated. Existing entity behaviour and prior test suites remain intact.
+
+## Included
+
+- Ensure the JPA mapping between `MonthlyCraReport` and its day entries is wired for cascading persistence and retrieval:
+  - In `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`, add a `@OneToMany` collection field (e.g. `List<CraDayEntry> dayEntries`) targeting the entity introduced in T003, with `mappedBy = "monthlyCraReport"` (or an owning-side foreign key column, matching the T003 mapping), `cascade = CascadeType.ALL`, `orphanRemoval = true`, and a `FetchType.LAZY` fetch strategy.
+  - Provide a small API on `MonthlyCraReport` to attach / detach day entries (`addDayEntry(CraDayEntry)`, `removeDayEntry(CraDayEntry)`) that keeps both sides of the association consistent. No behavioural change beyond wiring.
+  - If T003 introduced `CraDayEntry` without a JPA `@Entity` mapping or without a `monthlyCraReport` reference, add the minimal mapping required on that class to make the relationship work (annotations only — no field rename, no validation change, no new business rule).
+  - Only touch these two entity files; do not modify unrelated fields, constructors, or validation.
+- Create `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java`:
+  - Interface extending `org.springframework.data.jpa.repository.JpaRepository<MonthlyCraReport, Long>`.
+  - Declared query method `Optional<MonthlyCraReport> findByMonthAndYear(int month, int year)`.
+  - Declared query method `List<MonthlyCraReport> findAllByOrderByYearDescMonthDesc()` for history listing (most recent period first).
+  - No custom `@Query` unless a derived method cannot express the need.
+  - Annotate with `@Repository` for clarity (optional under Spring Data but keeps convention consistent with the existing package).
+- Add repository-level tests in `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java` using `@DataJpaTest` and `TestEntityManager` (aligned with `MonthlyCraReportPersistenceTest.java`):
+  - Save a report (with at least one attached `CraDayEntry`) and assert that both the parent id and the child entries are persisted after flush + clear + reload.
+  - `findById` returns the saved report with its day entries populated.
+  - `findByMonthAndYear` returns the report for a matching (month, year) and returns `Optional.empty()` when no match.
+  - `findAllByOrderByYearDescMonthDesc` returns multiple saved reports ordered by year desc then month desc.
+  - Update path: load a report, mutate a mutable field already exposed on the entity (e.g. `setStatus(ValidationStatus.SUBMITTED)`), save, reload, and assert the change persisted and `updatedAt` advanced.
+  - Add or remove a day entry on a persisted report and assert the change is reflected after reload (covers `cascade` and `orphanRemoval`).
+  - Reuse the existing `spring.jpa.hibernate.ddl-auto=create-drop` `@TestPropertySource` pattern from `MonthlyCraReportPersistenceTest`.
+- Do not introduce a service layer, DTOs, mappers, controllers, or new configuration classes. The repository is consumed directly by future tickets.
+- Package remains `com.timizer.backend.cra`. No new sub-package.
+
+## Excluded
+
+- REST controllers, HTTP endpoints, request/response DTOs.
+- Business service layer, transactional orchestration beyond what Spring Data provides by default.
+- PDF generation, expense handling, client signature workflow.
+- Frontend / calendar UI changes.
+- Authentication, authorization, security configuration.
+- Database migration tooling (Flyway/Liquibase) — schema continues to be produced by JPA `ddl-auto` as in existing tests.
+- Any change to the `ValidationStatus` enum, to entity validation constraints, or to the `MonthlyCraReport` constructor signature.
+- A dedicated `CraDayEntryRepository` — day entries are managed through the aggregate root via cascade in this ticket.
+- Query methods beyond the ones listed above (no pagination, no filtering by status, no search).
+
+## Acceptance criteria
+
+- `MonthlyCraReportRepository` exists in `com.timizer.backend.cra`, extends `JpaRepository<MonthlyCraReport, Long>`, and exposes `findByMonthAndYear(int, int)` and `findAllByOrderByYearDescMonthDesc()`.
+- A `MonthlyCraReport` with attached `CraDayEntry` instances can be saved and reloaded, with both the parent id and the day entries persisted.
+- Loading a report by identifier returns the same entity with its day entries accessible.
+- Looking up a report by month and year returns the persisted instance; a lookup with no match returns `Optional.empty()`.
+- Listing all reports returns them ordered by year descending, then month descending.
+- Reloading a persisted report, mutating an already-exposed field, and saving results in the change being visible on the next load, with `updatedAt` advanced.
+- Adding or removing a day entry on a managed report and saving is reflected on reload (cascade insert / orphan removal).
+- New repository tests pass under `@DataJpaTest`.
+- The pre-existing backend test suite (including `MonthlyCraReportTest` and `MonthlyCraReportPersistenceTest`) still passes with no regression.
+- No files outside `backend/src/main/java/com/timizer/backend/cra/` and `backend/src/test/java/com/timizer/backend/cra/` are modified.
diff --git a/runs/T004/prompts/coder-attempt-1.md b/runs/T004/prompts/coder-attempt-1.md
new file mode 100644
index 0000000..1bb6f50
--- /dev/null
+++ b/runs/T004/prompts/coder-attempt-1.md
@@ -0,0 +1,241 @@
+# GLOBAL CONTEXT
+
+# Global Context — Timizer Like
+
+## Project
+
+- project_id: timizer-like
+- repo: git@github.com:Billboc31/timizer-like.git
+
+## AI Dev Factory
+
+This project uses AI Dev Factory for AI-assisted development.
+
+Agent context folders:
+- `ai/` — roles and skills
+- `docs/` — project documentation
+- `prompts/` — ticket-specific and generic prompts
+- `runs/` — per-ticket runtime artifacts
+- `tickets/` — ticket definitions
+
+---
+
+# ROLE
+
+# Role — Coder
+
+## Mission
+
+Implémenter strictement un ticket en suivant le plan validé et les skills applicables.
+
+## Tu dois
+
+- lire le ticket
+- lire le plan validé
+- respecter le scope
+- lister les fichiers créés ou modifiés
+- produire un changement minimal, lisible et testable
+- ajouter ou adapter les tests si nécessaire
+- signaler les hypothèses et limites
+
+## Tu ne dois pas
+
+- élargir le ticket
+- réécrire l’architecture sans demande explicite
+- faire un refactor massif non demandé
+- modifier la mémoire projet sauf si le ticket le demande explicitement
+- masquer les erreurs ou incertitudes
+
+## Sortie attendue
+
+- résumé des changements
+- liste des fichiers modifiés
+- vérifications effectuées
+- limites connues
+
+## Règles
+
+- coder uniquement après `PLAN_APPROVED`
+- ne jamais contourner les contraintes du plan
+- garder les changements petits et reviewables
+
+---
+
+# SKILL: workflow-discipline
+
+# Skill — Workflow Discipline
+
+## Objectif
+
+Faire respecter le lifecycle officiel des tickets et PR IA.
+
+## Règles
+
+- respecter l’ordre des étapes du workflow
+- ne pas bypass les reviews obligatoires
+- maintenir les statuts cohérents
+- conserver les artefacts versionnés
+- séparer plan, implémentation et mémoire
+
+## Refuser si
+
+- une review obligatoire est sautée
+- la mémoire est mise à jour avant validation implémentation
+- le workflow officiel est contourné
+
+---
+
+# SKILL: git-discipline
+
+# Skill — Git Discipline
+
+## Objectif
+
+Maintenir un historique Git propre, compréhensible et traçable.
+
+## Règles
+
+- un ticket = une unité de travail cohérente
+- éviter les commits mélangeant plusieurs sujets
+- utiliser des messages de commit explicites
+- conserver les PR lisibles
+- éviter les modifications hors scope
+- maintenir les fichiers mémoire cohérents avec les changements réels
+
+## Refuser si
+
+- la PR mélange plusieurs fonctionnalités
+- des changements non liés sont ajoutés
+- les commits deviennent impossibles à reviewer
+
+---
+
+# SKILL: code-quality
+
+# Skill — Code Quality
+
+## Objectif
+
+Produire des changements simples, lisibles, robustes et faciles à reviewer.
+
+## Règles
+
+- privilégier le code simple avant le code sophistiqué
+- utiliser des noms explicites
+- garder des fonctions courtes et lisibles
+- éviter la magie cachée
+- gérer les erreurs explicitement
+- ajouter des logs utiles sans bruit excessif
+- éviter les dépendances inutiles
+- conserver un changement borné au ticket
+
+## Refuser si
+
+- le code devient inutilement complexe
+- le ticket introduit une dépendance non justifiée
+- les erreurs sont masquées
+- les changements dépassent le scope demandé
+
+---
+
+# SKILL: refactor-safety
+
+# Skill — Refactor Safety
+
+## Objectif
+
+Limiter les régressions et les dérives de scope lors des modifications.
+
+## Règles
+
+- modifier uniquement le périmètre demandé
+- éviter les refactors transversaux implicites
+- préserver les comportements existants
+- maintenir la compatibilité sauf demande explicite
+- privilégier des changements incrémentaux
+
+## Refuser si
+
+- le ticket dérive vers une réécriture globale
+- plusieurs couches sont modifiées sans justification
+- le comportement change silencieusement
+
+---
+
+# SKILL: security
+
+# Skill — Security
+
+## Objectif
+
+Réduire les risques de sécurité et éviter les comportements dangereux.
+
+## Règles
+
+- ne pas exposer de secrets dans logs ou documentation
+- limiter les permissions au strict nécessaire
+- éviter les exécutions implicites dangereuses
+- valider les entrées externes
+- documenter les impacts sécurité importants
+- éviter les comportements destructifs implicites
+
+## Refuser si
+
+- des secrets sont hardcodés
+- des données sensibles sont logguées
+- une opération destructive n’est pas explicitement contrôlée
+
+---
+
+# TASK
+
+# Generic Coder Task
+
+Read the ticket and the approved plan below, then implement the required changes.
+
+The implementation must:
+- follow the approved plan strictly
+- remain within scope
+- list all created or modified files
+- be minimal, readable, and testable
+
+The ticket follows.
+
+
+# T004 — Create CRA repository
+
+**Source**: GitHub Issue #7
+
+## Description
+
+## Context
+
+CRA records must be persisted and retrieved from SQLite.
+
+## Goal
+
+Create repository access for monthly CRA records.
+
+## Description
+
+Add backend repository support for saving, retrieving, updating, and listing monthly CRA records with their day entries.
+
+The repository must support lookup by month and year.
+
+## Out of Scope
+
+- REST controllers
+- Business services
+- PDF generation
+- Frontend code
+- Authentication
+- Client signature
+
+## Acceptance Criteria
+
+- CRA records can be saved
+- CRA records can be retrieved by identifier
+- CRA records can be retrieved by month and year
+- CRA records can be listed for history display
+- CRA records can be updated
+- Existing tests still pass
\ No newline at end of file
diff --git a/runs/T004/prompts/planner-attempt-1.md b/runs/T004/prompts/planner-attempt-1.md
new file mode 100644
index 0000000..d8fe67a
--- /dev/null
+++ b/runs/T004/prompts/planner-attempt-1.md
@@ -0,0 +1,247 @@
+# GLOBAL CONTEXT
+
+# Global Context — Timizer Like
+
+## Project
+
+- project_id: timizer-like
+- repo: git@github.com:Billboc31/timizer-like.git
+
+## AI Dev Factory
+
+This project uses AI Dev Factory for AI-assisted development.
+
+Agent context folders:
+- `ai/` — roles and skills
+- `docs/` — project documentation
+- `prompts/` — ticket-specific and generic prompts
+- `runs/` — per-ticket runtime artifacts
+- `tickets/` — ticket definitions
+
+---
+
+# ROLE
+
+# Role — Planner
+
+## Mission
+
+Lire un ticket et produire un plan d’implémentation court, concret, borné et actionnable.
+
+## Tu dois
+
+- comprendre le ticket
+- proposer les étapes minimales
+- lister les fichiers à créer ou modifier
+- identifier les risques
+- expliciter le hors scope
+- produire un plan Markdown versionnable
+- signaler les hypothèses nécessaires
+
+## Tu ne dois pas
+
+- coder
+- réécrire le ticket
+- anticiper les tickets suivants
+- élargir le scope
+- masquer les incertitudes
+
+## Sortie attendue
+
+Un fichier de plan conforme à `ai/templates/plan-template.md`.
+
+## Règles
+
+- le plan doit rester court
+- le plan doit être exécutable par un Coder sans ambiguïté
+- toute hypothèse doit être explicite
+- toute dérive de scope doit être refusée
+
+## Structure obligatoire
+
+Tout plan doit contenir au minimum **les sections suivantes** (titres
+Markdown niveau 2 — `##`). Les variantes anglaises sont acceptées à l'identique :
+
+| Français (recommandé)         | English equivalent       |
+|-------------------------------|--------------------------|
+| `## Contexte`                 | `## Context`             |
+| `## Objectif`                 | `## Objective`           |
+| `## Inclus`                   | `## Included`            |
+| `## Hors scope`               | `## Excluded`            |
+| `## Critères d'acceptation`   | `## Acceptance criteria` |
+
+Choisis une langue par plan, ne mélange pas FR et EN dans un même plan.
+
+Ces titres sont obligatoires même si une section est courte : un ticket
+trivial peut produire un plan court, mais la structure doit rester stable.
+
+Ne jamais produire uniquement un résumé.
+Ne jamais produire un compte rendu d’implémentation.
+
+## Interdictions absolues
+
+Tu ne dois jamais écrire :
+- "implémentation terminée"
+- "syntaxe valide"
+- "changements appliqués"
+- "voici ce qui a été fait"
+
+Tu dois produire uniquement un plan futur, pas un compte rendu passé.
+
+---
+
+# SKILL: workflow-discipline
+
+# Skill — Workflow Discipline
+
+## Objectif
+
+Faire respecter le lifecycle officiel des tickets et PR IA.
+
+## Règles
+
+- respecter l’ordre des étapes du workflow
+- ne pas bypass les reviews obligatoires
+- maintenir les statuts cohérents
+- conserver les artefacts versionnés
+- séparer plan, implémentation et mémoire
+
+## Refuser si
+
+- une review obligatoire est sautée
+- la mémoire est mise à jour avant validation implémentation
+- le workflow officiel est contourné
+
+---
+
+# SKILL: architecture-discipline
+
+# Skill — Architecture Discipline
+
+## Objectif
+
+Préserver la cohérence architecture du projet dans le temps.
+
+## Règles
+
+- respecter les invariants documentés
+- éviter les couplages implicites
+- éviter les dépendances inutiles
+- éviter les refactors transversaux non demandés
+- documenter toute nouvelle règle structurante
+- privilégier les changements locaux et bornés
+
+## Refuser si
+
+- le scope dérive
+- plusieurs couches sont modifiées sans justification
+- des conventions existantes sont cassées
+- la mémoire projet devient incohérente
+
+---
+
+# SKILL: documentation
+
+# Skill — Documentation
+
+## Objectif
+
+Maintenir une documentation utile, concise et alignée avec le code réel.
+
+## Règles
+
+- documenter les décisions importantes
+- éviter les documentations vagues
+- garder la mémoire projet cohérente
+- expliciter les invariants architecture
+- préférer Markdown simple et versionnable
+
+## Refuser si
+
+- la documentation diverge du comportement réel
+- la mémoire contient des suppositions non validées
+- des décisions importantes ne sont pas tracées
+
+---
+
+# TASK
+
+The ticket follows.
+# Generic Planner Task Read the ticket below and produce a detailed implementation plan.
+
+## Artifact-only output (strict)
+
+Your response will be written verbatim to `runs/<ticket>/plan.md`.
+Rewrite the artifact itself. Do not describe the modifications.
+Do not explain what changed. Do not produce a status report.
+
+This rule applies to both initial plans and rewrites after a review.
+Examples of forbidden openings: "The plan has been rewritten…",
+"This plan now covers…", "Plan rewritten as a real implementation
+document…", "Key points covered…", "The document now contains…".
+
+## Required output structure (strict) Your reply **MUST** be a Markdown document containing **exactly** these four level-2 headings, in this order, spelled exactly as shown:
+## Objective
+## Included
+## Excluded
+## Acceptance criteria
+These headings are mandatory even for trivial tickets. A short plan is acceptable — an unstructured plan is not. - ## Objective — one or two sentences describing what the change achieves. - ## Included — concrete changes (files, functions, logic, tests). - ## Excluded — what is explicitly out of scope for this ticket. - ## Acceptance criteria — verifiable conditions a reviewer can check. ## Invalid output Your reply is **invalid** if any of the four headings above is missing, renamed, mistyped, or replaced by a synonym (e.g. ## Goal, ## Scope, ## In scope, ## Out of scope, ## Plan, ## Tasks are **not** accepted). An invalid reply will be rejected by the automated validator and the ticket will be retried. You **MUST NOT** write: - "implementation done" - "changes applied" - "here is what was done" - any past-tense report of work already performed You produce a *future* plan, not a status report. ## Minimal valid example (for a trivial ticket)
+markdown
+## Objective
+Rename the helper `foo()` to `bar()` in `utils.py` to align with the new
+naming convention. Behaviour is preserved.
+
+## Included
+- `utils.py`: rename `foo` → `bar`, update the docstring.
+- `tests/test_utils.py`: update the single import and assertion.
+
+## Excluded
+- Renaming callers in other modules (tracked in a follow-up ticket).
+- Any logic change inside `foo` / `bar`.
+
+## Acceptance criteria
+- `utils.py` no longer defines `foo`.
+- `pytest tests/test_utils.py` passes.
+- No other file references the old name.
+
+The ticket follows.
+
+
+
+# T004 — Create CRA repository
+
+**Source**: GitHub Issue #7
+
+## Description
+
+## Context
+
+CRA records must be persisted and retrieved from SQLite.
+
+## Goal
+
+Create repository access for monthly CRA records.
+
+## Description
+
+Add backend repository support for saving, retrieving, updating, and listing monthly CRA records with their day entries.
+
+The repository must support lookup by month and year.
+
+## Out of Scope
+
+- REST controllers
+- Business services
+- PDF generation
+- Frontend code
+- Authentication
+- Client signature
+
+## Acceptance Criteria
+
+- CRA records can be saved
+- CRA records can be retrieved by identifier
+- CRA records can be retrieved by month and year
+- CRA records can be listed for history display
+- CRA records can be updated
+- Existing tests still pass
\ No newline at end of file
diff --git a/runs/T004/prompts/review-attempt-1.md b/runs/T004/prompts/review-attempt-1.md
new file mode 100644
index 0000000..48ebf05
--- /dev/null
+++ b/runs/T004/prompts/review-attempt-1.md
@@ -0,0 +1,222 @@
+# GLOBAL CONTEXT
+
+# Global Context — Timizer Like
+
+## Project
+
+- project_id: timizer-like
+- repo: git@github.com:Billboc31/timizer-like.git
+
+## AI Dev Factory
+
+This project uses AI Dev Factory for AI-assisted development.
+
+Agent context folders:
+- `ai/` — roles and skills
+- `docs/` — project documentation
+- `prompts/` — ticket-specific and generic prompts
+- `runs/` — per-ticket runtime artifacts
+- `tickets/` — ticket definitions
+
+---
+
+# ROLE
+
+# Role — Reviewer
+
+## Mission
+
+Vérifier qu’une implémentation respecte :
+- le ticket
+- le plan
+- les conventions
+- l’architecture
+- les contraintes sécurité/qualité
+
+## Tu dois
+
+- détecter les dérives de scope
+- détecter les violations architecture
+- vérifier les impacts potentiels
+- vérifier la cohérence mémoire/documentation
+- proposer des corrections concrètes
+
+## Tu ne dois pas
+
+- réécrire complètement le code
+- introduire un nouveau scope
+- accepter des comportements implicites dangereux
+
+## Sortie attendue
+
+Une review structurée conforme à `ai/templates/pr-review-template.md`.
+
+---
+
+# SKILL: workflow-discipline
+
+# Skill — Workflow Discipline
+
+## Objectif
+
+Faire respecter le lifecycle officiel des tickets et PR IA.
+
+## Règles
+
+- respecter l’ordre des étapes du workflow
+- ne pas bypass les reviews obligatoires
+- maintenir les statuts cohérents
+- conserver les artefacts versionnés
+- séparer plan, implémentation et mémoire
+
+## Refuser si
+
+- une review obligatoire est sautée
+- la mémoire est mise à jour avant validation implémentation
+- le workflow officiel est contourné
+
+---
+
+# SKILL: code-quality
+
+# Skill — Code Quality
+
+## Objectif
+
+Produire des changements simples, lisibles, robustes et faciles à reviewer.
+
+## Règles
+
+- privilégier le code simple avant le code sophistiqué
+- utiliser des noms explicites
+- garder des fonctions courtes et lisibles
+- éviter la magie cachée
+- gérer les erreurs explicitement
+- ajouter des logs utiles sans bruit excessif
+- éviter les dépendances inutiles
+- conserver un changement borné au ticket
+
+## Refuser si
+
+- le code devient inutilement complexe
+- le ticket introduit une dépendance non justifiée
+- les erreurs sont masquées
+- les changements dépassent le scope demandé
+
+---
+
+# SKILL: refactor-safety
+
+# Skill — Refactor Safety
+
+## Objectif
+
+Limiter les régressions et les dérives de scope lors des modifications.
+
+## Règles
+
+- modifier uniquement le périmètre demandé
+- éviter les refactors transversaux implicites
+- préserver les comportements existants
+- maintenir la compatibilité sauf demande explicite
+- privilégier des changements incrémentaux
+
+## Refuser si
+
+- le ticket dérive vers une réécriture globale
+- plusieurs couches sont modifiées sans justification
+- le comportement change silencieusement
+
+---
+
+# SKILL: security
+
+# Skill — Security
+
+## Objectif
+
+Réduire les risques de sécurité et éviter les comportements dangereux.
+
+## Règles
+
+- ne pas exposer de secrets dans logs ou documentation
+- limiter les permissions au strict nécessaire
+- éviter les exécutions implicites dangereuses
+- valider les entrées externes
+- documenter les impacts sécurité importants
+- éviter les comportements destructifs implicites
+
+## Refuser si
+
+- des secrets sont hardcodés
+- des données sensibles sont logguées
+- une opération destructive n’est pas explicitement contrôlée
+
+---
+
+# TASK
+
+# Generic Review Task
+
+Read the ticket below and review the implementation produced for it.
+
+The review must cover:
+- correctness relative to the ticket requirements
+- scope compliance
+- code quality and safety
+- blocking issues vs minor observations
+
+The ticket follows.
+
+
+# T004 — Create CRA repository
+
+**Source**: GitHub Issue #7
+
+## Description
+
+## Context
+
+CRA records must be persisted and retrieved from SQLite.
+
+## Goal
+
+Create repository access for monthly CRA records.
+
+## Description
+
+Add backend repository support for saving, retrieving, updating, and listing monthly CRA records with their day entries.
+
+The repository must support lookup by month and year.
+
+## Out of Scope
+
+- REST controllers
+- Business services
+- PDF generation
+- Frontend code
+- Authentication
+- Client signature
+
+## Acceptance Criteria
+
+- CRA records can be saved
+- CRA records can be retrieved by identifier
+- CRA records can be retrieved by month and year
+- CRA records can be listed for history display
+- CRA records can be updated
+- Existing tests still pass
+
+---
+
+## Contexte de retry injecté par run_ticket.py
+
+## Review decision keywords
+
+The review must end with exactly one valid workflow keyword on its own line.
+
+Approval keyword:
+IMPLEMENTATION_APPROVED
+
+Fix required keyword:
+IMPLEMENTATION_FIX_REQUIRED
diff --git a/runs/T004/prompts/review-attempt-2.md b/runs/T004/prompts/review-attempt-2.md
new file mode 100644
index 0000000..48ebf05
--- /dev/null
+++ b/runs/T004/prompts/review-attempt-2.md
@@ -0,0 +1,222 @@
+# GLOBAL CONTEXT
+
+# Global Context — Timizer Like
+
+## Project
+
+- project_id: timizer-like
+- repo: git@github.com:Billboc31/timizer-like.git
+
+## AI Dev Factory
+
+This project uses AI Dev Factory for AI-assisted development.
+
+Agent context folders:
+- `ai/` — roles and skills
+- `docs/` — project documentation
+- `prompts/` — ticket-specific and generic prompts
+- `runs/` — per-ticket runtime artifacts
+- `tickets/` — ticket definitions
+
+---
+
+# ROLE
+
+# Role — Reviewer
+
+## Mission
+
+Vérifier qu’une implémentation respecte :
+- le ticket
+- le plan
+- les conventions
+- l’architecture
+- les contraintes sécurité/qualité
+
+## Tu dois
+
+- détecter les dérives de scope
+- détecter les violations architecture
+- vérifier les impacts potentiels
+- vérifier la cohérence mémoire/documentation
+- proposer des corrections concrètes
+
+## Tu ne dois pas
+
+- réécrire complètement le code
+- introduire un nouveau scope
+- accepter des comportements implicites dangereux
+
+## Sortie attendue
+
+Une review structurée conforme à `ai/templates/pr-review-template.md`.
+
+---
+
+# SKILL: workflow-discipline
+
+# Skill — Workflow Discipline
+
+## Objectif
+
+Faire respecter le lifecycle officiel des tickets et PR IA.
+
+## Règles
+
+- respecter l’ordre des étapes du workflow
+- ne pas bypass les reviews obligatoires
+- maintenir les statuts cohérents
+- conserver les artefacts versionnés
+- séparer plan, implémentation et mémoire
+
+## Refuser si
+
+- une review obligatoire est sautée
+- la mémoire est mise à jour avant validation implémentation
+- le workflow officiel est contourné
+
+---
+
+# SKILL: code-quality
+
+# Skill — Code Quality
+
+## Objectif
+
+Produire des changements simples, lisibles, robustes et faciles à reviewer.
+
+## Règles
+
+- privilégier le code simple avant le code sophistiqué
+- utiliser des noms explicites
+- garder des fonctions courtes et lisibles
+- éviter la magie cachée
+- gérer les erreurs explicitement
+- ajouter des logs utiles sans bruit excessif
+- éviter les dépendances inutiles
+- conserver un changement borné au ticket
+
+## Refuser si
+
+- le code devient inutilement complexe
+- le ticket introduit une dépendance non justifiée
+- les erreurs sont masquées
+- les changements dépassent le scope demandé
+
+---
+
+# SKILL: refactor-safety
+
+# Skill — Refactor Safety
+
+## Objectif
+
+Limiter les régressions et les dérives de scope lors des modifications.
+
+## Règles
+
+- modifier uniquement le périmètre demandé
+- éviter les refactors transversaux implicites
+- préserver les comportements existants
+- maintenir la compatibilité sauf demande explicite
+- privilégier des changements incrémentaux
+
+## Refuser si
+
+- le ticket dérive vers une réécriture globale
+- plusieurs couches sont modifiées sans justification
+- le comportement change silencieusement
+
+---
+
+# SKILL: security
+
+# Skill — Security
+
+## Objectif
+
+Réduire les risques de sécurité et éviter les comportements dangereux.
+
+## Règles
+
+- ne pas exposer de secrets dans logs ou documentation
+- limiter les permissions au strict nécessaire
+- éviter les exécutions implicites dangereuses
+- valider les entrées externes
+- documenter les impacts sécurité importants
+- éviter les comportements destructifs implicites
+
+## Refuser si
+
+- des secrets sont hardcodés
+- des données sensibles sont logguées
+- une opération destructive n’est pas explicitement contrôlée
+
+---
+
+# TASK
+
+# Generic Review Task
+
+Read the ticket below and review the implementation produced for it.
+
+The review must cover:
+- correctness relative to the ticket requirements
+- scope compliance
+- code quality and safety
+- blocking issues vs minor observations
+
+The ticket follows.
+
+
+# T004 — Create CRA repository
+
+**Source**: GitHub Issue #7
+
+## Description
+
+## Context
+
+CRA records must be persisted and retrieved from SQLite.
+
+## Goal
+
+Create repository access for monthly CRA records.
+
+## Description
+
+Add backend repository support for saving, retrieving, updating, and listing monthly CRA records with their day entries.
+
+The repository must support lookup by month and year.
+
+## Out of Scope
+
+- REST controllers
+- Business services
+- PDF generation
+- Frontend code
+- Authentication
+- Client signature
+
+## Acceptance Criteria
+
+- CRA records can be saved
+- CRA records can be retrieved by identifier
+- CRA records can be retrieved by month and year
+- CRA records can be listed for history display
+- CRA records can be updated
+- Existing tests still pass
+
+---
+
+## Contexte de retry injecté par run_ticket.py
+
+## Review decision keywords
+
+The review must end with exactly one valid workflow keyword on its own line.
+
+Approval keyword:
+IMPLEMENTATION_APPROVED
+
+Fix required keyword:
+IMPLEMENTATION_FIX_REQUIRED
diff --git a/runs/T004/prompts/tester-attempt-1.md b/runs/T004/prompts/tester-attempt-1.md
new file mode 100644
index 0000000..68e9f3b
--- /dev/null
+++ b/runs/T004/prompts/tester-attempt-1.md
@@ -0,0 +1,184 @@
+# GLOBAL CONTEXT
+
+# Global Context — Timizer Like
+
+## Project
+
+- project_id: timizer-like
+- repo: git@github.com:Billboc31/timizer-like.git
+
+## AI Dev Factory
+
+This project uses AI Dev Factory for AI-assisted development.
+
+Agent context folders:
+- `ai/` — roles and skills
+- `docs/` — project documentation
+- `prompts/` — ticket-specific and generic prompts
+- `runs/` — per-ticket runtime artifacts
+- `tickets/` — ticket definitions
+
+---
+
+# ROLE
+
+# Role — Tester
+
+## Mission
+
+Valider qu’une implémentation respecte les critères d’acceptation du ticket.
+
+## Tu dois
+
+- exécuter les vérifications prévues
+- vérifier les comportements attendus
+- signaler les anomalies détectées
+- documenter les limites de validation
+- produire des résultats reproductibles
+
+## Tu ne dois pas
+
+- modifier le scope du ticket
+- introduire des changements fonctionnels importants
+- masquer un échec de validation
+
+## Sortie attendue
+
+- commandes exécutées
+- résultats obtenus
+- anomalies éventuelles
+- validation ou refus
+
+## Règles
+
+- tester uniquement après implémentation complète
+- documenter clairement les échecs
+- distinguer problème critique et amélioration optionnelle
+
+---
+
+# SKILL: workflow-discipline
+
+# Skill — Workflow Discipline
+
+## Objectif
+
+Faire respecter le lifecycle officiel des tickets et PR IA.
+
+## Règles
+
+- respecter l’ordre des étapes du workflow
+- ne pas bypass les reviews obligatoires
+- maintenir les statuts cohérents
+- conserver les artefacts versionnés
+- séparer plan, implémentation et mémoire
+
+## Refuser si
+
+- une review obligatoire est sautée
+- la mémoire est mise à jour avant validation implémentation
+- le workflow officiel est contourné
+
+---
+
+# SKILL: testing
+
+# Skill — Testing
+
+## Objectif
+
+Vérifier qu’un changement fonctionne et ne casse pas les comportements existants.
+
+## Règles
+
+- tester le comportement attendu
+- tester les erreurs critiques si possible
+- vérifier les impacts de bord évidents
+- privilégier les vérifications reproductibles
+- documenter les limites de test
+
+## Refuser si
+
+- aucun moyen de validation n’est proposé
+- un comportement critique est modifié sans vérification
+- les tests deviennent hors scope du ticket
+
+---
+
+# SKILL: debugging
+
+# Skill — Debugging
+
+## Objectif
+
+Diagnostiquer et corriger un problème avec méthode, sans introduire de régression.
+
+## Règles
+
+- comprendre le symptôme avant de corriger
+- identifier le chemin d’exécution concerné
+- formuler une hypothèse principale
+- reproduire le problème si possible
+- corriger au plus petit endroit pertinent
+- ajouter un test ou une vérification si le bug peut revenir
+- éviter les corrections globales non justifiées
+
+## Refuser si
+
+- la correction masque l’erreur sans résoudre la cause
+- la modification dépasse largement le bug initial
+- le bugfix introduit un refactor non demandé
+
+---
+
+# TASK
+
+# Generic Tester Task
+
+Read the ticket below and verify that the implementation satisfies its acceptance criteria.
+
+The test report must include:
+- each acceptance criterion and its status (pass / fail)
+- any regressions observed
+- blocking issues found
+
+The ticket follows.
+
+
+# T004 — Create CRA repository
+
+**Source**: GitHub Issue #7
+
+## Description
+
+## Context
+
+CRA records must be persisted and retrieved from SQLite.
+
+## Goal
+
+Create repository access for monthly CRA records.
+
+## Description
+
+Add backend repository support for saving, retrieving, updating, and listing monthly CRA records with their day entries.
+
+The repository must support lookup by month and year.
+
+## Out of Scope
+
+- REST controllers
+- Business services
+- PDF generation
+- Frontend code
+- Authentication
+- Client signature
+
+## Acceptance Criteria
+
+- CRA records can be saved
+- CRA records can be retrieved by identifier
+- CRA records can be retrieved by month and year
+- CRA records can be listed for history display
+- CRA records can be updated
+- Existing tests still pass
\ No newline at end of file
diff --git a/runs/T004/reviews/implementation-review.md b/runs/T004/reviews/implementation-review.md
new file mode 100644
index 0000000..e3ab6ae
--- /dev/null
+++ b/runs/T004/reviews/implementation-review.md
@@ -0,0 +1,11 @@
+Review écrite dans `runs/T004/reviews/review-attempt-2.md`.
+
+**Décision : IMPLEMENTATION_APPROVED**
+
+Résumé :
+- Aucun changement de code depuis review-attempt-1 (HEAD toujours `31adddd`) ; l'implémentation reste conforme au ticket et au plan approuvé.
+- Périmètre strict respecté : 4 fichiers dans `com.timizer.backend.cra`, delta `@OneToMany` chirurgical sur `MonthlyCraReport`, mapping minimal sur `CraDayEntry`, repository avec les deux méthodes dérivées attendues, 8 tests `@DataJpaTest` couvrant chaque acceptance criterion.
+- Aucun scope creep (pas de service, controller, DTO, config).
+- Concerns non-bloquants réitérés pour le merger (réconciliation `CraDayEntry` T003↔T004, conflit whole-file de `MonthlyCraReport.java` avec T002, exécution `./mvnw test` à faire post-merge complet).
+
+IMPLEMENTATION_APPROVED
diff --git a/runs/T004/reviews/review-attempt-1.md b/runs/T004/reviews/review-attempt-1.md
new file mode 100644
index 0000000..44b0b45
--- /dev/null
+++ b/runs/T004/reviews/review-attempt-1.md
@@ -0,0 +1,85 @@
+# PR Review — T004 (Create CRA repository)
+
+## Résumé
+
+Implémentation d'un `MonthlyCraReportRepository` (Spring Data JPA) pour persister/lire/lister/mettre à jour les rapports CRA mensuels avec cascade des `CraDayEntry`. 4 fichiers ajoutés dans `backend/src/main/java/com/timizer/backend/cra/` et `backend/src/test/java/com/timizer/backend/cra/`. Aucun fichier hors du package `cra` modifié.
+
+## Vérifications effectuées
+
+- Lecture du ticket T004 (`runs/T004/ticket.md`) et du plan approuvé (`runs/T004/plan.md`).
+- Lecture des 4 fichiers produits (`MonthlyCraReport.java`, `CraDayEntry.java`, `MonthlyCraReportRepository.java`, `MonthlyCraReportRepositoryTest.java`).
+- Diff de `MonthlyCraReport.java` contre la version de la branche `ticket/T002-create-cra-monthly-report-entity` pour isoler le delta T004.
+- Comparaison de `CraDayEntry.java` avec la version de la branche `ticket/T003-create-cra-day-entry-entity`.
+- Vérification que `ValidationStatus.SIGNED_BY_PROVIDER` existe bien dans la version T002 (utilisé par le test d'update).
+- Vérification de la présence/absence de `pom.xml`, `ValidationStatus.java`, et autres dépendances externes sur la branche T004.
+- Vérification que `runs/T004/state.json`, `workflow-status.md`, `implementation-output.md` documentent l'implémentation.
+
+## Points validés
+
+### Conformité ticket
+
+- `MonthlyCraReportRepository` étend `JpaRepository<MonthlyCraReport, Long>` → `save`, `findById`, `findAll`, `update` (via `save`) sont disponibles.
+- `findByMonthAndYear(int, int)` couvre la lookup par mois/année.
+- `findAllByOrderByYearDescMonthDesc()` couvre le listing historique (période desc).
+- Persistence des `CraDayEntry` via `@OneToMany(cascade = ALL, orphanRemoval = true)` sur `dayEntries`.
+- Aucun controller, service, DTO, mapper ou config nouveau — respect strict du Out of Scope du ticket.
+
+### Conformité plan
+
+- `@OneToMany(mappedBy = "monthlyCraReport", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)` conforme à la spec du plan.
+- API `addDayEntry` / `removeDayEntry` maintient les deux côtés de l'association cohérents (`entry.setMonthlyCraReport(this|null)`).
+- Repository annoté `@Repository`, méthodes dérivées uniquement (aucun `@Query`), package `com.timizer.backend.cra`.
+- Tests `@DataJpaTest` + `TestEntityManager` + `@TestPropertySource("spring.jpa.hibernate.ddl-auto=create-drop")` selon le pattern demandé.
+- Tous les scénarios listés dans le plan sont couverts par un test :
+  - save + flush + reload avec entries (`savesReportWithDayEntriesAndAssignsIdentifiers`)
+  - `findById` avec entries (`findByIdReturnsReportWithDayEntries`)
+  - `findByMonthAndYear` match + empty (`findByMonthAndYearReturnsMatchingReport`, `...ReturnsEmptyWhenNoMatch`)
+  - ordering desc year/month (`findAllByOrderByYearDescMonthDescReturnsReportsInDescendingPeriodOrder`)
+  - update + `updatedAt` advance (`updatingReportPersistsChangeAndAdvancesUpdatedAt`)
+  - cascade insert (`addingDayEntryToPersistedReportIsCascadedOnSave`)
+  - orphan removal (`removingDayEntryFromPersistedReportTriggersOrphanRemoval`)
+- Le delta T004 sur `MonthlyCraReport.java` est chirurgical (vérifié via diff avec T002) : uniquement imports + champ `dayEntries` + accesseur + `addDayEntry`/`removeDayEntry`. Aucune modification des champs, constructeur, validations, lifecycle callbacks existants.
+- Le test d'update utilise `ValidationStatus.SIGNED_BY_PROVIDER` (valeur réelle de T002) au lieu de `SUBMITTED` mentionné à titre d'exemple dans le plan — bonne adaptation.
+
+### Qualité
+
+- Nommage explicite, méthodes courtes, aucune "magie".
+- `addDayEntry`/`removeDayEntry` sont tolérants aux `null`.
+- Setter `setMonthlyCraReport` de `CraDayEntry` en package-private — évite exposition publique de la mécanique bi-directionnelle.
+- Aucun log parasite, aucune dépendance nouvelle introduite dans le code source (rappel : `pom.xml` reste de la responsabilité de T009).
+- Aucun secret ni donnée sensible dans le code ou les tests.
+
+## Problèmes détectés
+
+Aucun blocant sur le périmètre T004 lui-même. Points d'attention à documenter pour l'intégration :
+
+- **Divergence `CraDayEntry` vs conception T003 (à réconcilier au merge, non-bloquant pour T004)** : la version créée ici emploie `@ManyToOne MonthlyCraReport` alors que la version T003 conserve un `Long monthlyCraId` avec `@NotNull`, une contrainte d'unicité `(monthly_cra_id, date)`, une validation `WORK_VALUE_NONE/HALF/FULL` via `InvalidWorkValueException`, et un renommage de la colonne (`date` vs `entry_date`). La stratégie `@OneToMany`/`mappedBy` de T004 impose de fait un `@ManyToOne` côté enfant, donc la conception initiale de T003 ne peut pas cohabiter telle quelle. Cet arbitrage architectural devra être tranché au merge (T002 + T003 + T004 + T009) — c'est une conséquence connue du plan T004 ("If T003 introduced CraDayEntry without a `monthlyCraReport` reference, add the minimal mapping required"). Le coder T004 n'ayant pas T003 sur sa branche, il ne pouvait pas faire mieux.
+- **Acceptance criterion "New repository tests pass under @DataJpaTest" non vérifiable sur la branche T004 seule** : la branche ne contient ni `pom.xml` (T009), ni `ValidationStatus.java` (T002), ni la version T003 de `CraDayEntry`. La compilation et l'exécution des tests ne pourront être confirmées qu'à l'intégration. Cette limite est documentée dans `implementation-output.md` et suit le même pattern que T002/T005.
+- **Duplication complète du fichier `MonthlyCraReport.java` de T002** : c'est un artefact de branche (nécessaire pour porter le delta) mais générera un conflit whole-file au merge avec T002. Documentation explicite dans `implementation-output.md`, résolution attendue = keep-T004. Acceptable étant donné le pattern déjà utilisé par T002.
+
+## Risques éventuels
+
+- **Sémantique de la relation bidirectionnelle au merge** : quand T003 sera intégré, la conception `CraDayEntry` de T003 (identifiant plat) devra être écartée au profit du `@ManyToOne` pour que la cascade T004 fonctionne. Toute règle métier de T003 (contrainte d'unicité, validation `WORK_VALUE_*`, `@NotNull`) devra être portée sur la version T004 lors de la réconciliation, sous peine de régression fonctionnelle silencieuse. **À rappeler explicitement au merger** (probablement via mémoire projet ou note d'intégration) — pas d'action code T004 requise ici.
+- `getDayEntries()` retourne la liste interne mutable — un appelant pourrait bypasser `addDayEntry`/`removeDayEntry` et casser la cohérence bidirectionnelle. Reste dans le pattern habituel Spring/JPA et hors scope T004, mais à connaître si des futurs services manipulent la collection directement.
+- `updatingReportPersistsChangeAndAdvancesUpdatedAt` utilise `Thread.sleep(10)` pour garantir un `updatedAt` strictement postérieur — dépendance à la résolution de l'horloge système. Suffisant sur JVM moderne mais potentiellement flaky en CI très chargé. Observation mineure.
+
+## Décision
+
+- APPROVED
+
+Le périmètre strict de T004 (repository + tests + delta minimal sur `MonthlyCraReport`) est conforme au ticket et au plan approuvé. Les concerns identifiés relèvent tous de l'intégration multi-branches (T002/T003/T009) et sont soit anticipés par le plan, soit inévitables compte tenu du modèle "delta par branche" utilisé sur ce projet.
+
+## Actions demandées
+
+Aucune action bloquante pour T004. Actions recommandées à porter par l'agent de merge (hors scope T004) :
+
+1. Au merge T003 ↔ T004 : retenir la version `@ManyToOne MonthlyCraReport monthlyCraReport` (T004) mais **repérer et reporter** sur celle-ci les invariants T003 :
+   - contrainte d'unicité `(monthly_cra_report_id, date)` sur la table `cra_day_entry`
+   - constantes `WORK_VALUE_NONE/HALF/FULL` et rejet des autres valeurs via `InvalidWorkValueException`
+   - `@NotNull` sur `date`
+   - décider du nom de colonne (`date` T003 vs `entry_date` T004) et l'aligner avec le schéma cible
+   - retirer les setters `setDate`/`setWorkValue` publics de la version T004 si T003 les avait exclus délibérément
+2. Au merge T002 ↔ T004 : résoudre le conflit whole-file de `MonthlyCraReport.java` en gardant la version T004 (contient le delta `dayEntries`).
+3. Post-merge complet (T002 + T003 + T004 + T009) : exécuter `./mvnw test` et confirmer que les 8 nouveaux tests `MonthlyCraReportRepositoryTest` passent, et qu'aucun test T002/T003 pré-existant ne régresse.
+
+IMPLEMENTATION_APPROVED
diff --git a/runs/T004/reviews/review-attempt-2.md b/runs/T004/reviews/review-attempt-2.md
new file mode 100644
index 0000000..58e9be6
--- /dev/null
+++ b/runs/T004/reviews/review-attempt-2.md
@@ -0,0 +1,86 @@
+# PR Review — T004 (Create CRA repository) — attempt 2
+
+## Résumé
+
+Deuxième passe de review sur l'implémentation T004 (état `IMPLEMENTATION_REVIEW_NEEDED` re-déclenché ; aucun changement de code depuis attempt 1, cf. HEAD = `31adddd feat(T004/workflow): coder`). L'implémentation ajoute un `MonthlyCraReportRepository` Spring Data JPA plus le câblage minimal `@OneToMany` sur `MonthlyCraReport` et le back-ref `@ManyToOne` sur `CraDayEntry`. 4 fichiers sous `backend/src/main/java/com/timizer/backend/cra/` et `backend/src/test/java/com/timizer/backend/cra/`. Aucun fichier hors de ce package n'est touché.
+
+## Vérifications effectuées
+
+- Relecture du ticket (`runs/T004/ticket.md`) et du plan approuvé (`runs/T004/plan.md`).
+- Relecture directe des 4 fichiers produits :
+  - `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`
+  - `backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java`
+  - `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java`
+  - `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java`
+- Confirmation via `git log` que le seul commit T004 touchant `com.timizer.backend.cra` est `31adddd` — aucun code n'a bougé depuis review-attempt-1.
+- Contrôle de non-régression du scope (`git diff --stat main...HEAD`) : seuls des fichiers `backend/src/*/java/com/timizer/backend/cra/*.java` et `runs/T004/*` sont modifiés.
+
+## Points validés
+
+### Conformité ticket
+
+- Sauvegarde des CRA : `JpaRepository#save` disponible ; cascade sur `dayEntries` couvre les entries.
+- Lecture par identifiant : `JpaRepository#findById` ; test `findByIdReturnsReportWithDayEntries` valide la présence des entries après reload.
+- Lecture par mois/année : `findByMonthAndYear(int, int)` retourne `Optional<MonthlyCraReport>` (match + `empty` couverts).
+- Listing pour historique : `findAllByOrderByYearDescMonthDesc()` retourne la liste triée période desc.
+- Update : `JpaRepository#save` + test explicite `updatingReportPersistsChangeAndAdvancesUpdatedAt`.
+- Existing tests : aucune modification hors package `cra` ; les callbacks/validations de `MonthlyCraReport` de T002 sont préservés (aucun champ, constructeur ou lifecycle callback n'est réécrit).
+- Out of Scope respecté : ni controller, ni service, ni DTO, ni PDF, ni frontend, ni auth, ni signature client.
+
+### Conformité plan
+
+- `@OneToMany(mappedBy = "monthlyCraReport", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)` — exactement la spec du plan (`MonthlyCraReport.java:97-103`).
+- `addDayEntry` / `removeDayEntry` maintiennent la cohérence bidirectionnelle et tolèrent `null` (`MonthlyCraReport.java:212-226`).
+- `CraDayEntry` porte le back-ref `@ManyToOne(fetch = LAZY, optional = false)` avec `@JoinColumn(name = "monthly_cra_report_id", nullable = false)` — mapping minimal explicitement autorisé par le plan ("If T003 introduced CraDayEntry without a `monthlyCraReport` reference, add the minimal mapping required — annotations only").
+- Setter `setMonthlyCraReport` en package-private (`CraDayEntry.java:53`) → évite l'exposition publique de la mécanique bi-directionnelle. Bon choix.
+- Repository conforme : `extends JpaRepository<MonthlyCraReport, Long>`, `@Repository`, deux méthodes dérivées uniquement, pas de `@Query`.
+- Test class : `@DataJpaTest` + `TestEntityManager` + `@TestPropertySource("spring.jpa.hibernate.ddl-auto=create-drop")` (aligné avec `MonthlyCraReportPersistenceTest` de T002).
+- 8 tests couvrant chaque acceptance criterion du plan :
+  - `savesReportWithDayEntriesAndAssignsIdentifiers` — save + cascade (parent id + child ids).
+  - `findByIdReturnsReportWithDayEntries` — reload avec entries.
+  - `findByMonthAndYearReturnsMatchingReport` + `...ReturnsEmptyWhenNoMatch` — lookup + Optional.empty.
+  - `findAllByOrderByYearDescMonthDescReturnsReportsInDescendingPeriodOrder` — ordering (encodage `year*100+month` propre).
+  - `updatingReportPersistsChangeAndAdvancesUpdatedAt` — update + `updatedAt` avance.
+  - `addingDayEntryToPersistedReportIsCascadedOnSave` — cascade sur ajout.
+  - `removingDayEntryFromPersistedReportTriggersOrphanRemoval` — orphan removal.
+- Substitution `SUBMITTED` → `SIGNED_BY_PROVIDER` : le plan cite `SUBMITTED` à titre d'exemple, mais l'enum `ValidationStatus` de T002 ne l'expose pas ; le coder a correctement adapté sans dériver le scope.
+
+### Qualité (skills code-quality / refactor-safety / security)
+
+- Code simple, aucune méta-programmation ou magie cachée.
+- Nommage explicite (`findByMonthAndYear`, `addDayEntry`, `dayEntries`).
+- Le delta T004 sur `MonthlyCraReport.java` est chirurgical : imports (`ArrayList`, `List`, `CascadeType`, `FetchType`, `OneToMany`), champ `dayEntries`, `getDayEntries`, `addDayEntry`, `removeDayEntry`. Aucun champ, aucune contrainte, aucun setter, aucun `@PrePersist`/`@PreUpdate` existant n'est modifié.
+- Aucune dépendance nouvelle introduite (pas de touche à `pom.xml`, qui reste de la responsabilité de T009).
+- Aucun log parasite, aucun secret, aucune donnée sensible dans le code ou les tests.
+- Aucune opération destructive implicite ; `removeDayEntry` opère uniquement sur la collection managée.
+- Refactor-safety : périmètre strict `com.timizer.backend.cra`, pas de refactor transverse, comportement de T002 préservé.
+
+## Problèmes détectés
+
+Aucun bloquant sur le périmètre T004. Points d'attention (identiques à attempt 1, tous non-bloquants et attendus par le plan) :
+
+- **Divergence de conception `CraDayEntry` vs T003 à réconcilier au merge (non-bloquant pour T004)** : la version T004 utilise `@ManyToOne MonthlyCraReport monthlyCraReport` alors que T003 sur sa propre branche conserve un `Long monthlyCraId` avec `@NotNull`, une contrainte d'unicité `(monthly_cra_id, date)`, une validation `WORK_VALUE_NONE/HALF/FULL`, et le nom de colonne `date`. Le choix `@OneToMany`/`mappedBy` est imposé par le plan T004 lui-même. À reporter au merger — pas d'action code T004 requise.
+- **Acceptance criterion "New repository tests pass under @DataJpaTest" non vérifiable ici** : la branche T004 n'inclut ni `pom.xml` (T009), ni `ValidationStatus.java` (T002), ni la version T003 de `CraDayEntry`. La compilation et l'exécution des tests seront confirmées à l'intégration. Limitation documentée dans `implementation-output.md`, cohérente avec le pattern T002/T005.
+- **Copie whole-file de `MonthlyCraReport.java`** : nécessaire pour porter le delta T004 sur une branche cut depuis `main`. Conflit whole-file attendu au merge avec T002 ; résolution = keep-T004. Pattern déjà validé sur T002.
+
+## Risques éventuels
+
+- `getDayEntries()` expose la liste interne mutable — un futur consommateur pourrait bypasser `addDayEntry`/`removeDayEntry` et casser la cohérence bidirectionnelle. Reste conforme au pattern JPA usuel et hors scope T004.
+- `updatingReportPersistsChangeAndAdvancesUpdatedAt` utilise `Thread.sleep(10)` pour garantir `updatedAt` strictement postérieur. Dépendant de la résolution d'horloge ; suffisant sur JVM moderne mais potentiellement flaky en CI très chargé. Observation mineure.
+- Aucun risque sécurité identifié.
+
+## Décision
+
+- APPROVED
+
+Le périmètre strict T004 (repository + tests + delta minimal `@OneToMany` sur `MonthlyCraReport` + mapping minimal sur `CraDayEntry`) est conforme au ticket et au plan approuvé. Tous les acceptance criteria sont couverts par un test dédié. Les concerns identifiés relèvent de l'intégration multi-branches (T002/T003/T009) et sont explicitement anticipés par le plan.
+
+## Actions demandées
+
+Aucune action bloquante pour T004. Rappels pour le merger (hors scope T004, identiques à attempt 1) :
+
+1. Au merge T003 ↔ T004 : retenir la version `@ManyToOne monthlyCraReport` (T004), mais porter dessus les invariants T003 (`@NotNull date`, contrainte d'unicité `(monthly_cra_report_id, date)`, validation `WORK_VALUE_NONE/HALF/FULL`, décision sur le nom de colonne `date` vs `entry_date`, revue des setters publics).
+2. Au merge T002 ↔ T004 : conflit whole-file de `MonthlyCraReport.java` résolu en gardant la version T004 (qui contient le delta `dayEntries`).
+3. Post-merge complet (T002 + T003 + T004 + T009) : exécuter `./mvnw test` et confirmer que les 8 tests de `MonthlyCraReportRepositoryTest` passent, et qu'aucun test T002/T003 pré-existant ne régresse.
+
+IMPLEMENTATION_APPROVED
diff --git a/runs/T004/reviews/review-decision-context-IMPLEMENTATION_REVIEW_NEEDED.md b/runs/T004/reviews/review-decision-context-IMPLEMENTATION_REVIEW_NEEDED.md
new file mode 100644
index 0000000..1ad6cc7
--- /dev/null
+++ b/runs/T004/reviews/review-decision-context-IMPLEMENTATION_REVIEW_NEEDED.md
@@ -0,0 +1,9 @@
+## Review decision keywords
+
+The review must end with exactly one valid workflow keyword on its own line.
+
+Approval keyword:
+IMPLEMENTATION_APPROVED
+
+Fix required keyword:
+IMPLEMENTATION_FIX_REQUIRED
diff --git a/runs/T004/runtime.log b/runs/T004/runtime.log
new file mode 100644
index 0000000..13339fb
--- /dev/null
+++ b/runs/T004/runtime.log
@@ -0,0 +1,33 @@
+[2026-07-11T10:13:14Z] auto-run start: state=INIT
+[2026-07-11T10:13:14Z] auto-run: running step=planner
+[2026-07-11T10:13:14Z] prompt: resolved=prompts/generic/planner.md source=generic
+[2026-07-11T10:13:14Z] prompt: generic fallback — injecting runs/T004/ticket.md
+[2026-07-11T10:13:14Z] compose: global-context=docs/ai/global-context.md
+[2026-07-11T10:13:14Z] compose: role=ai/roles/planner.md
+[2026-07-11T10:13:14Z] compose: skill=ai/skills/workflow-discipline.md
+[2026-07-11T10:13:14Z] compose: skill=ai/skills/architecture-discipline.md
+[2026-07-11T10:13:14Z] compose: skill=ai/skills/documentation.md
+[2026-07-11T10:13:14Z] compose: task (canonical prompt)
+[2026-07-11T10:13:14Z] snapshot: runtime-prompt=runs/T004/prompts/planner-attempt-1.md
+[2026-07-11T10:15:09Z] auto-run: step=planner done rc=0
+[2026-07-11T10:31:31Z] auto-run start: state=IMPLEMENTATION_APPROVED
+[2026-07-11T10:31:31Z] auto-run: running step=tester
+[2026-07-11T10:31:31Z] prompt: resolved=prompts/generic/tester.md source=generic
+[2026-07-11T10:31:31Z] prompt: generic fallback — injecting runs/T004/ticket.md
+[2026-07-11T10:31:31Z] compose: global-context=docs/ai/global-context.md
+[2026-07-11T10:31:31Z] compose: role=ai/roles/tester.md
+[2026-07-11T10:31:31Z] compose: skill=ai/skills/workflow-discipline.md
+[2026-07-11T10:31:31Z] compose: skill=ai/skills/testing.md
+[2026-07-11T10:31:31Z] compose: skill=ai/skills/debugging.md
+[2026-07-11T10:31:31Z] compose: task (canonical prompt)
+[2026-07-11T10:31:31Z] snapshot: runtime-prompt=runs/T004/prompts/tester-attempt-1.md
+[2026-07-11T10:35:25Z] auto-run: step=tester done rc=0
+[2026-07-11T10:35:25Z] auto-run: transition IMPLEMENTATION_APPROVED → TEST_COMPLETE
+[2026-07-11T10:35:25Z] auto-run: auto-commit triggered (step=tester, include_code=True)
+[2026-07-11T10:35:26Z] commit-checkpoint: unstaged runtime garbage: ['runs/T004/daemon.lock', 'runs/T004/runtime.log']
+[2026-07-11T10:35:26Z] commit-checkpoint: sha=217849b files=5 title='test(T004/workflow): tester — update 5 file(s)'
+[2026-07-11T10:35:26Z] auto-run: auto-push triggered
+[2026-07-11T10:35:26Z] push: tolerating runtime dirty files (not blocking): ['runs/T004/daemon.lock', 'runs/T004/runtime.log']
+[2026-07-11T10:35:26Z] push: pushing branch=ticket/T004-create-cra-repository
+[2026-07-11T10:35:27Z] push: done branch=ticket/T004-create-cra-repository
+[2026-07-11T10:35:28Z] auto-run: TEST_COMPLETE — running PR lifecycle
diff --git a/runs/T004/state.json b/runs/T004/state.json
new file mode 100644
index 0000000..4996721
--- /dev/null
+++ b/runs/T004/state.json
@@ -0,0 +1,7 @@
+{
+  "ticket_id": "T004",
+  "state": "TEST_COMPLETE",
+  "branch": "ticket/T004-create-cra-repository",
+  "issue_number": 7,
+  "updated_at": "2026-07-11T10:35:25Z"
+}
\ No newline at end of file
diff --git a/runs/T004/tests/test-report.md b/runs/T004/tests/test-report.md
new file mode 100644
index 0000000..45caf9c
--- /dev/null
+++ b/runs/T004/tests/test-report.md
@@ -0,0 +1,32 @@
+# Test Report — T004
+
+**Decision: VALIDATED (pending post-merge runtime confirmation).**
+Full report written to `runs/T004/tests/tester-report-attempt-1.md`.
+
+## What I did
+
+- Read ticket, plan, implementation-output, and both review attempts.
+- Statically walked each ticket acceptance criterion → each has a matching test method in `MonthlyCraReportRepositoryTest`.
+- **Compiled the 4 files off-branch** in `/tmp` with jars from `~/.m2`. Both `javac` invocations returned exit 0 (main + test), no functional warnings. The only stub added was a 3-value `ValidationStatus` enum standing in for T002's contribution.
+- Verified scope: only files under `backend/src/{main,test}/java/com/timizer/backend/cra/` are touched.
+
+## Acceptance criteria
+
+| Criterion | Test | Status |
+|---|---|---|
+| Save CRA records | `savesReportWithDayEntriesAndAssignsIdentifiers` | PASS (static) |
+| Retrieve by id | `findByIdReturnsReportWithDayEntries` | PASS (static) |
+| Retrieve by month + year | `findByMonthAndYearReturnsMatchingReport` + empty case | PASS (static) |
+| List for history | `findAllByOrderByYearDescMonthDescReturnsReportsInDescendingPeriodOrder` | PASS (static) |
+| Update | `updatingReportPersistsChangeAndAdvancesUpdatedAt` | PASS (static) |
+| Existing tests still pass | Delta is strictly additive on `MonthlyCraReport`; T002 fields/constructor/lifecycle callbacks untouched | PASS structurally / UNVERIFIED at runtime |
+
+Bonus coverage (cascade insert + orphan removal) also covered by dedicated tests.
+
+## Blocking limitation
+
+`./mvnw test` cannot run on this ticket branch — no `pom.xml` (T009), no `ValidationStatus` (T002), no T002 pre-existing tests to re-run for the regression check. Same isolated-ticket-branch pattern already used by T002/T005 and explicitly acknowledged by the coder and reviewer. **Runtime `@DataJpaTest` execution must be re-run once T002+T003+T004+T009 are merged on the integration branch.**
+
+## Anomalies
+
+None on the T004 delta. Non-blocking: `Thread.sleep(10)` in the `updatedAt` test is slightly flaky under CI load; `getDayEntries()` returns a live mutable list — both already flagged by the reviewer.
diff --git a/runs/T004/tests/tester-report-attempt-1.md b/runs/T004/tests/tester-report-attempt-1.md
new file mode 100644
index 0000000..28c2eb0
--- /dev/null
+++ b/runs/T004/tests/tester-report-attempt-1.md
@@ -0,0 +1,95 @@
+# Tester Report — T004 (Create CRA repository) — attempt 1
+
+## Decision
+
+**VALIDATED WITH LIMITATION** — All acceptance criteria are covered by dedicated tests and the code compiles cleanly against Spring Data JPA 3.3.5 / Jakarta Persistence 3.1 / JUnit 5 / AssertJ / Spring Boot Test 3.3.5. Runtime execution of the `@DataJpaTest` suite (`./mvnw test`) is not possible on the isolated T004 branch and must be re-run once T002 (`ValidationStatus`), T003 (`CraDayEntry` invariants), and T009 (`backend/pom.xml`) are merged in.
+
+## Scope of validation
+
+- Branch: `ticket/T004-create-cra-repository` (HEAD `30c26e1`).
+- Ticket: `runs/T004/ticket.md` (source: GitHub Issue #7).
+- Plan: `runs/T004/plan.md` (approved).
+- Implementation output: `runs/T004/implementation-output.md`.
+- Files under test (all under `com.timizer.backend.cra`):
+  - `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`
+  - `backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java`
+  - `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java`
+  - `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java`
+
+## Commands executed
+
+Since `backend/` on this ticket branch contains only Java sources (no `pom.xml`, no `mvnw`, no `ValidationStatus` from T002), test execution was performed indirectly:
+
+1. Copied the 4 T004 files into a temp workspace `/tmp/t004-testcompile/`.
+2. Added a minimal `ValidationStatus` stub (`DRAFT`, `SIGNED_BY_PROVIDER`, `VALIDATED`) matching the values documented in `runs/T004/implementation-output.md` — needed only to make `javac` resolve the enum references coming from T002.
+3. Assembled a classpath from the local Maven cache (`~/.m2/repository`):
+   - `jakarta.persistence-api:3.1.0`
+   - `jakarta.validation-api:3.0.2`
+   - `spring-data-jpa:3.3.5`
+   - `spring-data-commons:3.3.5`
+   - `spring-context:6.1.14`, `spring-beans:6.1.14`, `spring-test:6.1.14`
+   - `junit-jupiter-api:5.10.5`
+   - `assertj-core:3.25.3`
+   - `spring-boot-test:3.3.5`, `spring-boot-test-autoconfigure:3.3.5`
+4. `javac -d out-main -cp <classpath> src/com/timizer/backend/cra/*.java` → **exit 0, no diagnostics**.
+5. `javac -d out-test -cp <classpath>:out-main test/com/timizer/backend/cra/*.java` → **exit 0** (only 2 benign `unknown enum constant Status.STABLE` warnings coming from `apiguardian-api` missing docs — no functional impact).
+6. Cleaned up `/tmp/t004-testcompile/`.
+
+Full `@DataJpaTest` runtime execution (Hibernate schema bootstrap, `TestEntityManager`, transactional isolation) was **not** performed — see the "Blocking limitation" section below.
+
+## Results — Acceptance criteria coverage
+
+| # | Ticket acceptance criterion | Test / mechanism | Status |
+|---|---|---|---|
+| 1 | CRA records can be saved | `savesReportWithDayEntriesAndAssignsIdentifiers` (repository.save + flush + reload asserts non-null id and 2 persisted `CraDayEntry` children) | PASS (static) |
+| 2 | CRA records can be retrieved by identifier | `findByIdReturnsReportWithDayEntries` (findById returns Optional present with day-entry dates matching) | PASS (static) |
+| 3 | CRA records can be retrieved by month and year | `findByMonthAndYearReturnsMatchingReport` + `findByMonthAndYearReturnsEmptyWhenNoMatch` (both match and `Optional.empty` paths covered) | PASS (static) |
+| 4 | CRA records can be listed for history display | `findAllByOrderByYearDescMonthDescReturnsReportsInDescendingPeriodOrder` (year desc then month desc across 3 reports) | PASS (static) |
+| 5 | CRA records can be updated | `updatingReportPersistsChangeAndAdvancesUpdatedAt` (status change persists + `updatedAt` strictly advances after `Thread.sleep(10)`) | PASS (static) |
+| 6 | Existing tests still pass | Diff is strictly scoped to `com.timizer.backend.cra`. `MonthlyCraReport` T002 fields, constructor, validation, `@PrePersist`/`@PreUpdate` callbacks are untouched. T002 `MonthlyCraReportPersistenceTest` and `MonthlyCraReportTest` are not present on this ticket branch and therefore cannot be re-executed here. | PASS (structural) / UNVERIFIED at runtime |
+
+Extra coverage beyond the ticket criteria (from the plan): cascade insert (`addingDayEntryToPersistedReportIsCascadedOnSave`) and orphan removal (`removingDayEntryFromPersistedReportTriggersOrphanRemoval`) — both statically PASS.
+
+## Static / semantic checks performed
+
+- `MonthlyCraReportRepository` extends `JpaRepository<MonthlyCraReport, Long>`, exposes `Optional<MonthlyCraReport> findByMonthAndYear(int, int)` and `List<MonthlyCraReport> findAllByOrderByYearDescMonthDesc()` as declared derived queries. Method names match Spring Data JPA parsing rules — `findByMonthAndYear` → `WHERE month = ?1 AND year = ?2`; `findAllByOrderByYearDescMonthDesc` → `ORDER BY year DESC, month DESC`.
+- `@OneToMany(mappedBy = "monthlyCraReport", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)` on `MonthlyCraReport.dayEntries` — matches the mapping expected by `CraDayEntry.monthlyCraReport` (`@ManyToOne(fetch = LAZY, optional = false)`), both directions consistent.
+- `addDayEntry` / `removeDayEntry` maintain the bidirectional invariant (both sides updated, null-safe, package-private setter on the child to prevent bypass).
+- `@DataJpaTest` + `TestEntityManager` + `@TestPropertySource("spring.jpa.hibernate.ddl-auto=create-drop")` — same pattern as the T002 `MonthlyCraReportPersistenceTest`, per plan.
+- Scope check (`git diff --stat main..HEAD` intent): only `backend/src/*/java/com/timizer/backend/cra/*.java` + `runs/T004/*` are touched — matches "No files outside `backend/src/main/java/com/timizer/backend/cra/` and `backend/src/test/java/com/timizer/backend/cra/` are modified" in the plan.
+
+## Anomalies detected
+
+None on the T004 delta itself.
+
+Non-blocking observations (already flagged by the reviewer):
+
+- `updatingReportPersistsChangeAndAdvancesUpdatedAt` relies on `Thread.sleep(10)` for `updatedAt` monotonicity. Sufficient on JVM with millisecond `Instant.now()` resolution but slightly flaky under heavy CI contention. Not blocking.
+- `getDayEntries()` returns the live mutable `ArrayList`. A future caller that mutates directly (rather than through `addDayEntry`/`removeDayEntry`) would break the bidirectional invariant. Out of scope for T004 (existing Java pattern) — flag for a later ticket if it matters.
+
+## Blocking limitation on runtime execution
+
+The T004 ticket branch was cut from `main` and does **not** contain:
+
+- `backend/pom.xml` (owned by T009) → no Maven build possible, no `./mvnw test`.
+- `com.timizer.backend.cra.ValidationStatus` (owned by T002) → `MonthlyCraReport.java` and `MonthlyCraReportRepositoryTest.java` reference `ValidationStatus.DRAFT` and `ValidationStatus.SIGNED_BY_PROVIDER` and will not compile without T002.
+- T003's authoritative `CraDayEntry` (unique constraint `(monthly_cra_id, date)`, `WORK_VALUE_NONE/HALF/FULL` validation, `@NotNull date`) → T004's `CraDayEntry` was written in the minimal shape needed by the repository, per plan clause "annotations only". A merge conflict is expected and normal.
+- T002's pre-existing `MonthlyCraReportTest` / `MonthlyCraReportPersistenceTest` → cannot re-run the "no regression on existing tests" acceptance criterion at runtime here.
+
+This is the same isolated-ticket-branch limitation as T002 / T005, and is explicitly acknowledged in `runs/T004/implementation-output.md` and `runs/T004/reviews/review-attempt-2.md`.
+
+## Validation
+
+**PASS — pending post-merge runtime confirmation.**
+
+- All 6 ticket acceptance criteria are covered by targeted tests (or by structural code invariants for criterion #6).
+- Both the 3 main sources and the test source compile cleanly against the exact Spring Boot 3.3.5 dependency stack. There is no syntactic or type error blocking test execution.
+- No scope leakage: only the 4 T004 files are modified, all inside `com.timizer.backend.cra`.
+
+## Follow-up required at merge time (not T004 work)
+
+1. Resolve the whole-file conflict on `MonthlyCraReport.java` between T002 and T004 by keeping the T004 version (which is T002 + the `@OneToMany dayEntries` delta).
+2. Reconcile `CraDayEntry` between T003 (invariants, unique constraint, work-value validation) and T004 (`@ManyToOne monthlyCraReport` back-reference). Keep T004's relationship mapping; port T003's constraints on top.
+3. Once T002 + T003 + T004 + T009 are all present on the integration branch, run `./mvnw -pl backend test` and confirm:
+   - the 8 new tests in `MonthlyCraReportRepositoryTest` all pass;
+   - the pre-existing `MonthlyCraReportTest` and `MonthlyCraReportPersistenceTest` still pass with zero regression.
diff --git a/runs/T004/ticket.md b/runs/T004/ticket.md
new file mode 100644
index 0000000..329b7bb
--- /dev/null
+++ b/runs/T004/ticket.md
@@ -0,0 +1,37 @@
+# T004 — Create CRA repository
+
+**Source**: GitHub Issue #7
+
+## Description
+
+## Context
+
+CRA records must be persisted and retrieved from SQLite.
+
+## Goal
+
+Create repository access for monthly CRA records.
+
+## Description
+
+Add backend repository support for saving, retrieving, updating, and listing monthly CRA records with their day entries.
+
+The repository must support lookup by month and year.
+
+## Out of Scope
+
+- REST controllers
+- Business services
+- PDF generation
+- Frontend code
+- Authentication
+- Client signature
+
+## Acceptance Criteria
+
+- CRA records can be saved
+- CRA records can be retrieved by identifier
+- CRA records can be retrieved by month and year
+- CRA records can be listed for history display
+- CRA records can be updated
+- Existing tests still pass
diff --git a/runs/T004/workflow-status.md b/runs/T004/workflow-status.md
new file mode 100644
index 0000000..d9acb19
--- /dev/null
+++ b/runs/T004/workflow-status.md
@@ -0,0 +1,48 @@
+# Workflow Status
+
+## Current Status
+
+- PLAN_APPROVED
+- PLAN_FIX_REQUIRED
+- IMPLEMENTATION_APPROVED
+- IMPLEMENTATION_FIX_REQUIRED
+- MEMORY_APPROVED
+- MEMORY_FIX_REQUIRED
+
+## Risk Level
+
+- AUTO_SAFE
+- CHAT_REVIEW_REQUIRED
+- HIGH_RISK
+
+## Notes
+
+## 2026-07-11T10:15:11Z
+
+- prev: INIT
+- step: planner
+- next: PLAN_REVIEW_NEEDED
+
+## 2026-07-11T10:15:11Z
+
+- prev: PLAN_REVIEW_NEEDED
+- step: auto-approve
+- next: PLAN_APPROVED
+
+## 2026-07-11T10:21:57Z
+
+- prev: PLAN_APPROVED
+- step: coder
+- next: IMPLEMENTATION_REVIEW_NEEDED
+
+## 2026-07-11T10:30:06Z
+
+- prev: IMPLEMENTATION_REVIEW_NEEDED
+- step: review
+- next: IMPLEMENTATION_APPROVED
+
+## 2026-07-11T10:35:25Z
+
+- prev: IMPLEMENTATION_APPROVED
+- step: tester
+- next: TEST_COMPLETE
```

---

## Ticket branch diff since merge-base (98e74cae)

```diff
diff --git a/runs/T004/daemon.lock b/runs/T004/daemon.lock
new file mode 100644
index 0000000..4e796b0
--- /dev/null
+++ b/runs/T004/daemon.lock
@@ -0,0 +1 @@
+{"pid": 14150, "created_at": "2026-07-11T10:13:14Z"}
\ No newline at end of file
diff --git a/runs/T004/plan.md b/runs/T004/plan.md
new file mode 100644
index 0000000..8459117
--- /dev/null
+++ b/runs/T004/plan.md
@@ -0,0 +1,52 @@
+## Objective
+
+Introduce a Spring Data JPA repository for `MonthlyCraReport` so that monthly CRA records — together with their day entries — can be persisted to SQLite, retrieved by identifier or by (month, year), listed for history, and updated. Existing entity behaviour and prior test suites remain intact.
+
+## Included
+
+- Ensure the JPA mapping between `MonthlyCraReport` and its day entries is wired for cascading persistence and retrieval:
+  - In `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java`, add a `@OneToMany` collection field (e.g. `List<CraDayEntry> dayEntries`) targeting the entity introduced in T003, with `mappedBy = "monthlyCraReport"` (or an owning-side foreign key column, matching the T003 mapping), `cascade = CascadeType.ALL`, `orphanRemoval = true`, and a `FetchType.LAZY` fetch strategy.
+  - Provide a small API on `MonthlyCraReport` to attach / detach day entries (`addDayEntry(CraDayEntry)`, `removeDayEntry(CraDayEntry)`) that keeps both sides of the association consistent. No behavioural change beyond wiring.
+  - If T003 introduced `CraDayEntry` without a JPA `@Entity` mapping or without a `monthlyCraReport` reference, add the minimal mapping required on that class to make the relationship work (annotations only — no field rename, no validation change, no new business rule).
+  - Only touch these two entity files; do not modify unrelated fields, constructors, or validation.
+- Create `backend/src/main/java/com/timizer/backend/cra/MonthlyCraReportRepository.java`:
+  - Interface extending `org.springframework.data.jpa.repository.JpaRepository<MonthlyCraReport, Long>`.
+  - Declared query method `Optional<MonthlyCraReport> findByMonthAndYear(int month, int year)`.
+  - Declared query method `List<MonthlyCraReport> findAllByOrderByYearDescMonthDesc()` for history listing (most recent period first).
+  - No custom `@Query` unless a derived method cannot express the need.
+  - Annotate with `@Repository` for clarity (optional under Spring Data but keeps convention consistent with the existing package).
+- Add repository-level tests in `backend/src/test/java/com/timizer/backend/cra/MonthlyCraReportRepositoryTest.java` using `@DataJpaTest` and `TestEntityManager` (aligned with `MonthlyCraReportPersistenceTest.java`):
+  - Save a report (with at least one attached `CraDayEntry`) and assert that both the parent id and the child entries are persisted after flush + clear + reload.
+  - `findById` returns the saved report with its day entries populated.
+  - `findByMonthAndYear` returns the report for a matching (month, year) and returns `Optional.empty()` when no match.
+  - `findAllByOrderByYearDescMonthDesc` returns multiple saved reports ordered by year desc then month desc.
+  - Update path: load a report, mutate a mutable field already exposed on the entity (e.g. `setStatus(ValidationStatus.SUBMITTED)`), save, reload, and assert the change persisted and `updatedAt` advanced.
+  - Add or remove a day entry on a persisted report and assert the change is reflected after reload (covers `cascade` and `orphanRemoval`).
+  - Reuse the existing `spring.jpa.hibernate.ddl-auto=create-drop` `@TestPropertySource` pattern from `MonthlyCraReportPersistenceTest`.
+- Do not introduce a service layer, DTOs, mappers, controllers, or new configuration classes. The repository is consumed directly by future tickets.
+- Package remains `com.timizer.backend.cra`. No new sub-package.
+
+## Excluded
+
+- REST controllers, HTTP endpoints, request/response DTOs.
+- Business service layer, transactional orchestration beyond what Spring Data provides by default.
+- PDF generation, expense handling, client signature workflow.
+- Frontend / calendar UI changes.
+- Authentication, authorization, security configuration.
+- Database migration tooling (Flyway/Liquibase) — schema continues to be produced by JPA `ddl-auto` as in existing tests.
+- Any change to the `ValidationStatus` enum, to entity validation constraints, or to the `MonthlyCraReport` constructor signature.
+- A dedicated `CraDayEntryRepository` — day entries are managed through the aggregate root via cascade in this ticket.
+- Query methods beyond the ones listed above (no pagination, no filtering by status, no search).
+
+## Acceptance criteria
+
+- `MonthlyCraReportRepository` exists in `com.timizer.backend.cra`, extends `JpaRepository<MonthlyCraReport, Long>`, and exposes `findByMonthAndYear(int, int)` and `findAllByOrderByYearDescMonthDesc()`.
+- A `MonthlyCraReport` with attached `CraDayEntry` instances can be saved and reloaded, with both the parent id and the day entries persisted.
+- Loading a report by identifier returns the same entity with its day entries accessible.
+- Looking up a report by month and year returns the persisted instance; a lookup with no match returns `Optional.empty()`.
+- Listing all reports returns them ordered by year descending, then month descending.
+- Reloading a persisted report, mutating an already-exposed field, and saving results in the change being visible on the next load, with `updatedAt` advanced.
+- Adding or removing a day entry on a managed report and saving is reflected on reload (cascade insert / orphan removal).
+- New repository tests pass under `@DataJpaTest`.
+- The pre-existing backend test suite (including `MonthlyCraReportTest` and `MonthlyCraReportPersistenceTest`) still passes with no regression.
+- No files outside `backend/src/main/java/com/timizer/backend/cra/` and `backend/src/test/java/com/timizer/backend/cra/` are modified.
diff --git a/runs/T004/prompts/planner-attempt-1.md b/runs/T004/prompts/planner-attempt-1.md
new file mode 100644
index 0000000..d8fe67a
--- /dev/null
+++ b/runs/T004/prompts/planner-attempt-1.md
@@ -0,0 +1,247 @@
+# GLOBAL CONTEXT
+
+# Global Context — Timizer Like
+
+## Project
+
+- project_id: timizer-like
+- repo: git@github.com:Billboc31/timizer-like.git
+
+## AI Dev Factory
+
+This project uses AI Dev Factory for AI-assisted development.
+
+Agent context folders:
+- `ai/` — roles and skills
+- `docs/` — project documentation
+- `prompts/` — ticket-specific and generic prompts
+- `runs/` — per-ticket runtime artifacts
+- `tickets/` — ticket definitions
+
+---
+
+# ROLE
+
+# Role — Planner
+
+## Mission
+
+Lire un ticket et produire un plan d’implémentation court, concret, borné et actionnable.
+
+## Tu dois
+
+- comprendre le ticket
+- proposer les étapes minimales
+- lister les fichiers à créer ou modifier
+- identifier les risques
+- expliciter le hors scope
+- produire un plan Markdown versionnable
+- signaler les hypothèses nécessaires
+
+## Tu ne dois pas
+
+- coder
+- réécrire le ticket
+- anticiper les tickets suivants
+- élargir le scope
+- masquer les incertitudes
+
+## Sortie attendue
+
+Un fichier de plan conforme à `ai/templates/plan-template.md`.
+
+## Règles
+
+- le plan doit rester court
+- le plan doit être exécutable par un Coder sans ambiguïté
+- toute hypothèse doit être explicite
+- toute dérive de scope doit être refusée
+
+## Structure obligatoire
+
+Tout plan doit contenir au minimum **les sections suivantes** (titres
+Markdown niveau 2 — `##`). Les variantes anglaises sont acceptées à l'identique :
+
+| Français (recommandé)         | English equivalent       |
+|-------------------------------|--------------------------|
+| `## Contexte`                 | `## Context`             |
+| `## Objectif`                 | `## Objective`           |
+| `## Inclus`                   | `## Included`            |
+| `## Hors scope`               | `## Excluded`            |
+| `## Critères d'acceptation`   | `## Acceptance criteria` |
+
+Choisis une langue par plan, ne mélange pas FR et EN dans un même plan.
+
+Ces titres sont obligatoires même si une section est courte : un ticket
+trivial peut produire un plan court, mais la structure doit rester stable.
+
+Ne jamais produire uniquement un résumé.
+Ne jamais produire un compte rendu d’implémentation.
+
+## Interdictions absolues
+
+Tu ne dois jamais écrire :
+- "implémentation terminée"
+- "syntaxe valide"
+- "changements appliqués"
+- "voici ce qui a été fait"
+
+Tu dois produire uniquement un plan futur, pas un compte rendu passé.
+
+---
+
+# SKILL: workflow-discipline
+
+# Skill — Workflow Discipline
+
+## Objectif
+
+Faire respecter le lifecycle officiel des tickets et PR IA.
+
+## Règles
+
+- respecter l’ordre des étapes du workflow
+- ne pas bypass les reviews obligatoires
+- maintenir les statuts cohérents
+- conserver les artefacts versionnés
+- séparer plan, implémentation et mémoire
+
+## Refuser si
+
+- une review obligatoire est sautée
+- la mémoire est mise à jour avant validation implémentation
+- le workflow officiel est contourné
+
+---
+
+# SKILL: architecture-discipline
+
+# Skill — Architecture Discipline
+
+## Objectif
+
+Préserver la cohérence architecture du projet dans le temps.
+
+## Règles
+
+- respecter les invariants documentés
+- éviter les couplages implicites
+- éviter les dépendances inutiles
+- éviter les refactors transversaux non demandés
+- documenter toute nouvelle règle structurante
+- privilégier les changements locaux et bornés
+
+## Refuser si
+
+- le scope dérive
+- plusieurs couches sont modifiées sans justification
+- des conventions existantes sont cassées
+- la mémoire projet devient incohérente
+
+---
+
+# SKILL: documentation
+
+# Skill — Documentation
+
+## Objectif
+
+Maintenir une documentation utile, concise et alignée avec le code réel.
+
+## Règles
+
+- documenter les décisions importantes
+- éviter les documentations vagues
+- garder la mémoire projet cohérente
+- expliciter les invariants architecture
+- préférer Markdown simple et versionnable
+
+## Refuser si
+
+- la documentation diverge du comportement réel
+- la mémoire contient des suppositions non validées
+- des décisions importantes ne sont pas tracées
+
+---
+
+# TASK
+
+The ticket follows.
+# Generic Planner Task Read the ticket below and produce a detailed implementation plan.
+
+## Artifact-only output (strict)
+
+Your response will be written verbatim to `runs/<ticket>/plan.md`.
+Rewrite the artifact itself. Do not describe the modifications.
+Do not explain what changed. Do not produce a status report.
+
+This rule applies to both initial plans and rewrites after a review.
+Examples of forbidden openings: "The plan has been rewritten…",
+"This plan now covers…", "Plan rewritten as a real implementation
+document…", "Key points covered…", "The document now contains…".
+
+## Required output structure (strict) Your reply **MUST** be a Markdown document containing **exactly** these four level-2 headings, in this order, spelled exactly as shown:
+## Objective
+## Included
+## Excluded
+## Acceptance criteria
+These headings are mandatory even for trivial tickets. A short plan is acceptable — an unstructured plan is not. - ## Objective — one or two sentences describing what the change achieves. - ## Included — concrete changes (files, functions, logic, tests). - ## Excluded — what is explicitly out of scope for this ticket. - ## Acceptance criteria — verifiable conditions a reviewer can check. ## Invalid output Your reply is **invalid** if any of the four headings above is missing, renamed, mistyped, or replaced by a synonym (e.g. ## Goal, ## Scope, ## In scope, ## Out of scope, ## Plan, ## Tasks are **not** accepted). An invalid reply will be rejected by the automated validator and the ticket will be retried. You **MUST NOT** write: - "implementation done" - "changes applied" - "here is what was done" - any past-tense report of work already performed You produce a *future* plan, not a status report. ## Minimal valid example (for a trivial ticket)
+markdown
+## Objective
+Rename the helper `foo()` to `bar()` in `utils.py` to align with the new
+naming convention. Behaviour is preserved.
+
+## Included
+- `utils.py`: rename `foo` → `bar`, update the docstring.
+- `tests/test_utils.py`: update the single import and assertion.
+
+## Excluded
+- Renaming callers in other modules (tracked in a follow-up ticket).
+- Any logic change inside `foo` / `bar`.
+
+## Acceptance criteria
+- `utils.py` no longer defines `foo`.
+- `pytest tests/test_utils.py` passes.
+- No other file references the old name.
+
+The ticket follows.
+
+
+
+# T004 — Create CRA repository
+
+**Source**: GitHub Issue #7
+
+## Description
+
+## Context
+
+CRA records must be persisted and retrieved from SQLite.
+
+## Goal
+
+Create repository access for monthly CRA records.
+
+## Description
+
+Add backend repository support for saving, retrieving, updating, and listing monthly CRA records with their day entries.
+
+The repository must support lookup by month and year.
+
+## Out of Scope
+
+- REST controllers
+- Business services
+- PDF generation
+- Frontend code
+- Authentication
+- Client signature
+
+## Acceptance Criteria
+
+- CRA records can be saved
+- CRA records can be retrieved by identifier
+- CRA records can be retrieved by month and year
+- CRA records can be listed for history display
+- CRA records can be updated
+- Existing tests still pass
\ No newline at end of file
diff --git a/runs/T004/runtime.log b/runs/T004/runtime.log
new file mode 100644
index 0000000..f979d55
--- /dev/null
+++ b/runs/T004/runtime.log
@@ -0,0 +1,12 @@
+[2026-07-11T10:13:14Z] auto-run start: state=INIT
+[2026-07-11T10:13:14Z] auto-run: running step=planner
+[2026-07-11T10:13:14Z] prompt: resolved=prompts/generic/planner.md source=generic
+[2026-07-11T10:13:14Z] prompt: generic fallback — injecting runs/T004/ticket.md
+[2026-07-11T10:13:14Z] compose: global-context=docs/ai/global-context.md
+[2026-07-11T10:13:14Z] compose: role=ai/roles/planner.md
+[2026-07-11T10:13:14Z] compose: skill=ai/skills/workflow-discipline.md
+[2026-07-11T10:13:14Z] compose: skill=ai/skills/architecture-discipline.md
+[2026-07-11T10:13:14Z] compose: skill=ai/skills/documentation.md
+[2026-07-11T10:13:14Z] compose: task (canonical prompt)
+[2026-07-11T10:13:14Z] snapshot: runtime-prompt=runs/T004/prompts/planner-attempt-1.md
+[2026-07-11T10:15:09Z] auto-run: step=planner done rc=0
diff --git a/runs/T004/state.json b/runs/T004/state.json
new file mode 100644
index 0000000..0320c10
--- /dev/null
+++ b/runs/T004/state.json
@@ -0,0 +1,7 @@
+{
+  "ticket_id": "T004",
+  "state": "PLAN_APPROVED",
+  "branch": "ticket/T004-create-cra-repository",
+  "issue_number": 7,
+  "updated_at": "2026-07-11T10:15:11Z"
+}
\ No newline at end of file
diff --git a/runs/T004/ticket.md b/runs/T004/ticket.md
new file mode 100644
index 0000000..329b7bb
--- /dev/null
+++ b/runs/T004/ticket.md
@@ -0,0 +1,37 @@
+# T004 — Create CRA repository
+
+**Source**: GitHub Issue #7
+
+## Description
+
+## Context
+
+CRA records must be persisted and retrieved from SQLite.
+
+## Goal
+
+Create repository access for monthly CRA records.
+
+## Description
+
+Add backend repository support for saving, retrieving, updating, and listing monthly CRA records with their day entries.
+
+The repository must support lookup by month and year.
+
+## Out of Scope
+
+- REST controllers
+- Business services
+- PDF generation
+- Frontend code
+- Authentication
+- Client signature
+
+## Acceptance Criteria
+
+- CRA records can be saved
+- CRA records can be retrieved by identifier
+- CRA records can be retrieved by month and year
+- CRA records can be listed for history display
+- CRA records can be updated
+- Existing tests still pass
diff --git a/runs/T004/workflow-status.md b/runs/T004/workflow-status.md
new file mode 100644
index 0000000..44ce507
--- /dev/null
+++ b/runs/T004/workflow-status.md
@@ -0,0 +1,30 @@
+# Workflow Status
+
+## Current Status
+
+- PLAN_APPROVED
+- PLAN_FIX_REQUIRED
+- IMPLEMENTATION_APPROVED
+- IMPLEMENTATION_FIX_REQUIRED
+- MEMORY_APPROVED
+- MEMORY_FIX_REQUIRED
+
+## Risk Level
+
+- AUTO_SAFE
+- CHAT_REVIEW_REQUIRED
+- HIGH_RISK
+
+## Notes
+
+## 2026-07-11T10:15:11Z
+
+- prev: INIT
+- step: planner
+- next: PLAN_REVIEW_NEEDED
+
+## 2026-07-11T10:15:11Z
+
+- prev: PLAN_REVIEW_NEEDED
+- step: auto-approve
+- next: PLAN_APPROVED
```

---

## Conflicted Files

### backend/src/main/java/com/timizer/backend/cra/CraDayEntry.java

```
package com.timizer.backend.cra;

import java.time.LocalDate;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
    name = "cra_day_entry",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_cra_day_entry_month_day",
        columnNames = {"monthly_cra_report_id", "entry_date"}
    )
)
public class CraDayEntry {

    static final double WORK_VALUE_NONE = 0.0;
    static final double WORK_VALUE_HALF = 0.5;
    static final double WORK_VALUE_FULL = 1.0;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "monthly_cra_report_id", nullable = false)
    private MonthlyCraReport monthlyCraReport;

    @Transient
    private Long monthlyCraIdOnConstruction;

    @NotNull
    @Column(name = "entry_date", nullable = false)
    private LocalDate date;

    @Column(name = "work_value", nullable = false)
    private double workValue;

    @Column(name = "note")
    private String note;

    protected CraDayEntry() {
    }

    public CraDayEntry(Long monthlyCraId, LocalDate date, double workValue, String note) {
        Objects.requireNonNull(monthlyCraId, "monthlyCraId must not be null");
        Objects.requireNonNull(date, "date must not be null");
        if (!isAllowedWorkValue(workValue)) {
            throw new InvalidWorkValueException(workValue);
        }
        this.monthlyCraIdOnConstruction = monthlyCraId;
        this.date = date;
        this.workValue = workValue;
        this.note = note;
    }

    public CraDayEntry(LocalDate date, double workValue, String note) {
        Objects.requireNonNull(date, "date must not be null");
        if (!isAllowedWorkValue(workValue)) {
            throw new InvalidWorkValueException(workValue);
        }
        this.date = date;
        this.workValue = workValue;
        this.note = note;
    }

    private static boolean isAllowedWorkValue(double value) {
        if (Double.isNaN(value) || Double.isInfinite(value)) {
            return false;
        }
        return value == WORK_VALUE_NONE || value == WORK_VALUE_HALF || value == WORK_VALUE_FULL;
    }

    public Long getId() {
        return id;
    }

    public MonthlyCraReport getMonthlyCraReport() {
        return monthlyCraReport;
    }

    void setMonthlyCraReport(MonthlyCraReport monthlyCraReport) {
        this.monthlyCraReport = monthlyCraReport;
    }

    public Long getMonthlyCraId() {
        if (monthlyCraReport != null) {
            return monthlyCraReport.getId();
        }
        return monthlyCraIdOnConstruction;
    }

    public LocalDate getDate() {
        return date;
    }

    public double getWorkValue() {
        return workValue;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
```

### backend/src/main/java/com/timizer/backend/cra/MonthlyCraReport.java

```
package com.timizer.backend.cra;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
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

    @OneToMany(
        mappedBy = "monthlyCraReport",
        cascade = CascadeType.ALL,
        orphanRemoval = true,
        fetch = FetchType.LAZY
    )
    private List<CraDayEntry> dayEntries = new ArrayList<>();

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

    public List<CraDayEntry> getDayEntries() {
        return dayEntries;
    }

    public void addDayEntry(CraDayEntry entry) {
        if (entry == null) {
            return;
        }
        dayEntries.add(entry);
        entry.setMonthlyCraReport(this);
    }

    public void removeDayEntry(CraDayEntry entry) {
        if (entry == null) {
            return;
        }
        dayEntries.remove(entry);
        entry.setMonthlyCraReport(null);
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
```