package com.timizer.backend.cra;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "cra_transition_event")
public class CraTransitionEvent {

    public enum EventType {
        TRANSITION,
        SIGNATURE,
        INVALIDATION,
        FAILED_TRANSITION
    }

    public enum ActorType {
        CONSULTANT,
        CLIENT,
        SYSTEM
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "cra_id", nullable = false)
    private Long craId;

    @Enumerated(EnumType.STRING)
    @Column(name = "from_status")
    private ValidationStatus fromStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "to_status", nullable = false)
    private ValidationStatus toStatus;

    @Enumerated(EnumType.STRING)
    @Column(name = "event_type", nullable = false)
    private EventType eventType;

    @Enumerated(EnumType.STRING)
    @Column(name = "actor_type")
    private ActorType actorType;

    @Column(name = "actor_name")
    private String actorName;

    @Column(name = "details")
    private String details;

    @Column(name = "occurred_at", nullable = false)
    private Instant occurredAt;

    protected CraTransitionEvent() {
    }

    public CraTransitionEvent(
            Long craId,
            ValidationStatus fromStatus,
            ValidationStatus toStatus,
            EventType eventType,
            ActorType actorType,
            String actorName,
            String details) {
        this.craId = craId;
        this.fromStatus = fromStatus;
        this.toStatus = toStatus;
        this.eventType = eventType;
        this.actorType = actorType;
        this.actorName = actorName;
        this.details = details;
        this.occurredAt = Instant.now();
    }

    public Long getId() { return id; }
    public Long getCraId() { return craId; }
    public ValidationStatus getFromStatus() { return fromStatus; }
    public ValidationStatus getToStatus() { return toStatus; }
    public EventType getEventType() { return eventType; }
    public ActorType getActorType() { return actorType; }
    public String getActorName() { return actorName; }
    public String getDetails() { return details; }
    public Instant getOccurredAt() { return occurredAt; }
}
