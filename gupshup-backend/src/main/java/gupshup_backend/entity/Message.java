package gupshup_backend.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_messages_chat_day", columnList = "chat_day, created_at")
})
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 500)
    private String text;

    @Column(name = "reply_to_id")
    private Long replyToId;

    @Column(name = "chat_day", nullable = false)
    private LocalDate chatDay;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User v) { this.user = v; }
    public String getText() { return text; }
    public void setText(String v) { this.text = v; }
    public Long getReplyToId() { return replyToId; }
    public void setReplyToId(Long v) { this.replyToId = v; }
    public LocalDate getChatDay() { return chatDay; }
    public void setChatDay(LocalDate v) { this.chatDay = v; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant v) { this.createdAt = v; }
}