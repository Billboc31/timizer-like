package com.timizer.backend.cra;

import java.util.Collection;
import java.util.Objects;

import org.springframework.stereotype.Service;

@Service
public class CraTotalCalculationService {

    public double calculateTotalWorkedDays(Collection<CraDayEntry> dayEntries) {
        Objects.requireNonNull(dayEntries, "dayEntries must not be null");
        double total = 0.0;
        for (CraDayEntry entry : dayEntries) {
            if (entry == null) {
                throw new IllegalArgumentException("dayEntries must not contain null elements");
            }
            total += entry.getWorkValue();
        }
        return total;
    }
}
