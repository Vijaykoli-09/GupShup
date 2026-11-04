package gupshup_backend.repository;

import gupshup_backend.entity.User;
import gupshup_backend.entity.UserStatus;
import java.time.Instant;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByPhone(String phone);
    Optional<User> findByPublicUsername(String publicUsername);
    boolean existsByPhone(String phone);
    boolean existsByPublicUsername(String publicUsername);

    long countByStatusIn(Collection<UserStatus> statuses);

    @Query("select count(u) from User u where u.status = :banned "
         + "and (u.banUntil is null or u.banUntil > :now)")
    long countActiveBans(@Param("banned") UserStatus banned, @Param("now") Instant now);

    @Query("select u from User u where u.status in :statuses and ("
         + ":q = '' or lower(u.publicUsername) like lower(concat('%', :q, '%')) "
         + "or lower(concat(u.firstName, ' ', u.lastName)) like lower(concat('%', :q, '%')) "
         + "or lower(u.city) like lower(concat('%', :q, '%')) "
         + "or u.phone like concat('%', :q, '%') "
         + "or cast(u.id as string) = :q) order by u.id")
    List<User> search(@Param("statuses") Collection<UserStatus> statuses, @Param("q") String q);
}