package gupshup_backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "reports")
public class Report {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reporter_id", nullable = false)
    private User reporter;

    @ManyToOne(optional = false)
    @JoinColumn(name = "reported_user_id", nullable = false)
    private User reportedUser;

    /** Snapshot of the username at report time. */
    @Column(name = "reported_username", nullable = false, length = 40)
    private String reportedUsername;

    /** No foreign key: the message may be deleted by the 3 AM cleanup. */
    @Column(name = "message_id")
    private Long messageId;

    /** Copy of the message text, kept as moderation evidence. */
    @Column(name = "message_text", length = 500)
    private String messageText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReportReason reason;

    @Column(length = 300)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ReportStatus status = ReportStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public User getReporter() { return reporter; }
    public void setReporter(User v) { this.reporter = v; }
    public User getReportedUser() { return reportedUser; }
    public void setReportedUser(User v) { this.reportedUser = v; }
    public String getReportedUsername() { return reportedUsername; }
    public void setReportedUsername(String v) { this.reportedUsername = v; }
    public Long getMessageId() { return messageId; }
    public void setMessageId(Long v) { this.messageId = v; }
    public String getMessageText() { return messageText; }
    public void setMessageText(String v) { this.messageText = v; }
    public ReportReason getReason() { return reason; }
    public void setReason(ReportReason v) { this.reason = v; }
    public String getDescription() { return description; }
    public void setDescription(String v) { this.description = v; }
    public ReportStatus getStatus() { return status; }
    public void setStatus(ReportStatus v) { this.status = v; }
    public Instant getCreatedAt() { return createdAt; }
}