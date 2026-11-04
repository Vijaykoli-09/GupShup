package gupshup_backend.repository;

import gupshup_backend.entity.Report;
import gupshup_backend.entity.ReportStatus;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface ReportRepository extends JpaRepository<Report, Long> {
    boolean existsByReporterIdAndMessageId(Long reporterId, Long messageId);

    long countByStatus(ReportStatus status);

    List<Report> findAllByOrderByCreatedAtDesc();

    List<Report> findByStatusOrderByCreatedAtDesc(ReportStatus status);

    @Query("select r.messageId, count(r) from Report r where r.messageId in :ids group by r.messageId")
    List<Object[]> countByMessageIds(@Param("ids") Collection<Long> ids);
}