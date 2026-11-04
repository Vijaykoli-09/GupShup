package gupshup_backend.repository;

import gupshup_backend.entity.AdminAccount;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AdminRepository extends JpaRepository<AdminAccount, Long> {
    Optional<AdminAccount> findByEmail(String email);
    boolean existsByEmail(String email);
}
