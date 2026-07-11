package com.timizer.backend.cra;

import java.time.LocalDate;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(
    name = "cra_day_entry",
    uniqueConstraints = @UniqueConstraint(
        name = "uk_cra_day_entry_month_day",
        columnNames = {"monthly_cra_id", "date"}
    )
)
public class CraDayEntry {

    static final double WORK_VALUE_NONE = 0.0;
    static final double WORK_VALUE_HALF = 0.5;
    static final double WORK_VALUE_FULL = 1.0;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "monthly_cra_id", nullable = false)
    private Long monthlyCraId;

    @NotNull
    @Column(name = "date", nullable = false)
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
        this.monthlyCraId = monthlyCraId;
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

    public Long getMonthlyCraId() {
        return monthlyCraId;
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
