package com.timizer.backend.cra;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CraSignatureTokenRepository extends JpaRepository<CraSignatureToken, Long> {

    Optional<CraSignatureToken> findByTokenHash(String tokenHash);

    Optional<CraSignatureToken> findByCraId(Long craId);

    void deleteByCraId(Long craId);
}
