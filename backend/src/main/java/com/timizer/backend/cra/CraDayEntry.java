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

    public void updateWorkValue(double workValue) {
        if (!isAllowedWorkValue(workValue)) {
            throw new InvalidWorkValueException(workValue);
        }
        this.workValue = workValue;
    }
}
