package gupshup_backend.repository;

import gupshup_backend.entity.Message;
import java.time.LocalDate;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findByChatDayOrderByCreatedAtAsc(LocalDate chatDay);

    Optional<Message> findTopByUserIdOrderByCreatedAtDesc(Long userId);

    long countByChatDay(LocalDate chatDay);

    @Modifying
    @Query("delete from Message m where m.chatDay < :day")
    int deleteOlderThan(@Param("day") LocalDate day);

    @Query("select m.id from Message m where m.user.id = :userId")
    List<Long> findIdsByUserId(@Param("userId") Long userId);

    @Modifying
    @Query("delete from Message m where m.user.id = :userId")
    int deleteByUserId(@Param("userId") Long userId);

    @Query("select m.id from Message m where m.id in :ids")
    List<Long> findExistingIds(@Param("ids") Collection<Long> ids);

    @Query("select m from Message m where m.chatDay = :day and ("
         + ":q = '' or lower(m.text) like lower(concat('%', :q, '%')) "
         + "or lower(m.user.publicUsername) like lower(concat('%', :q, '%'))) "
         + "order by m.createdAt desc")
    List<Message> searchByChatDay(@Param("day") LocalDate day, @Param("q") String q);
}