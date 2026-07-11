package com.timizer.backend.cra;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface MonthlyCraReportRepository extends JpaRepository<MonthlyCraReport, Long> {

    Optional<MonthlyCraReport> findByMonthAndYear(int month, int year);

    List<MonthlyCraReport> findAllByOrderByYearDescMonthDesc();
}
