package com.timizer.backend.cra;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CraDayEntryRepository extends JpaRepository<CraDayEntry, Long> {

    Optional<CraDayEntry> findByMonthlyCraReport_IdAndDate(Long craId, LocalDate date);

    List<CraDayEntry> findByMonthlyCraReport_IdOrderByDateAsc(Long craId);
}
