package com.timizerlike.cra.service;

import org.springframework.stereotype.Service;

import com.timizer.backend.cra.CraTransitionEvent;
import com.timizer.backend.cra.CraTransitionEvent.ActorType;
import com.timizer.backend.cra.CraTransitionEvent.EventType;
import com.timizer.backend.cra.CraTransitionEventRepository;
import com.timizer.backend.cra.ValidationStatus;

@Service
public class CraAuditService {

    private final CraTransitionEventRepository eventRepository;

    public CraAuditService(CraTransitionEventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    public void recordTransition(
            Long craId,
            ValidationStatus from,
            ValidationStatus to,
            ActorType actorType,
            String actorName) {
        eventRepository.save(new CraTransitionEvent(
                craId, from, to, EventType.TRANSITION, actorType, actorName, null));
    }

    public void recordInvalidation(Long craId, ValidationStatus from, String reason) {
        eventRepository.save(new CraTransitionEvent(
                craId, from, ValidationStatus.DRAFT, EventType.INVALIDATION,
                ActorType.CONSULTANT, null, reason));
    }

    public void recordFailedTransition(Long craId, ValidationStatus currentStatus, String reason) {
        eventRepository.save(new CraTransitionEvent(
                craId, currentStatus, currentStatus, EventType.FAILED_TRANSITION,
                ActorType.SYSTEM, null, reason));
    }
}
