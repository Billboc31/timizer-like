package com.timizer.backend.cra;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CraTransitionEventRepository extends JpaRepository<CraTransitionEvent, Long> {
    List<CraTransitionEvent> findByCraIdOrderByOccurredAtAsc(Long craId);

    void deleteAllByCraId(Long craId);
}
