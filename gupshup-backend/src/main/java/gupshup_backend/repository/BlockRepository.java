package gupshup_backend.repository;

import gupshup_backend.entity.Block;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BlockRepository extends JpaRepository<Block, Long> {

    boolean existsByBlockerIdAndBlockedId(Long blockerId, Long blockedId);

    List<Block> findByBlockerIdOrderByCreatedAtDesc(Long blockerId);

    Optional<Block> findByIdAndBlockerId(Long id, Long blockerId);

    @Query("select b.blockedId from Block b where b.blockerId = :blockerId")
    List<Long> findBlockedIds(@Param("blockerId") Long blockerId);

    @Modifying
    @Query("delete from Block b where b.blockerId = :userId or b.blockedId = :userId")
    int deleteAllInvolving(@Param("userId") Long userId);
}