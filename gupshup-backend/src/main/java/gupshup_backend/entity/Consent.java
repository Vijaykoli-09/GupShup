package gupshup_backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "consents", uniqueConstraints = {
    @UniqueConstraint(name = "uk_consent", columnNames = {"user_id", "document_type", "version"})
})
public class Consent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "document_type", nullable = false, length = 30)
    private ConsentDocument documentType;

    @Column(nullable = false, length = 20)
    private String version;

    @Column(name = "accepted_at", nullable = false, updatable = false)
    private Instant acceptedAt = Instant.now();

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long v) { this.userId = v; }
    public ConsentDocument getDocumentType() { return documentType; }
    public void setDocumentType(ConsentDocument v) { this.documentType = v; }
    public String getVersion() { return version; }
    public void setVersion(String v) { this.version = v; }
    public Instant getAcceptedAt() { return acceptedAt; }
}
