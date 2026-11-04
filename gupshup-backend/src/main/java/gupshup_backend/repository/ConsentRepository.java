package gupshup_backend.repository;

import gupshup_backend.entity.Consent;
import gupshup_backend.entity.ConsentDocument;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ConsentRepository extends JpaRepository<Consent, Long> {
    boolean existsByUserIdAndDocumentTypeAndVersion(Long userId, ConsentDocument type, String version);
    long countByUserIdAndVersion(Long userId, String version);
}
