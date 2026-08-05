package com.timizer.backend.cra;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CraDownloadTokenRepository extends JpaRepository<CraDownloadToken, Long> {

    Optional<CraDownloadToken> findByTokenHash(String tokenHash);

    void deleteAllByCraId(Long craId);
}
