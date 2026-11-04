package gupshup_backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "blocks", uniqueConstraints = {
    @UniqueConstraint(name = "uk_block_pair", columnNames = {"blocker_id", "blocked_id"})
})
public class Block {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "blocker_id", nullable = false)
    private Long blockerId;

    @Column(name = "blocked_id", nullable = false)
    private Long blockedId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public Long getBlockerId() { return blockerId; }
    public void setBlockerId(Long v) { this.blockerId = v; }
    public Long getBlockedId() { return blockedId; }
    public void setBlockedId(Long v) { this.blockedId = v; }
    public Instant getCreatedAt() { return createdAt; }
}