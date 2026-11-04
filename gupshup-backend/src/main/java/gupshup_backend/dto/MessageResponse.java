package gupshup_backend.dto;

import java.time.Instant;

public record MessageResponse(
    Long id,
    String username,
    String text,
    Instant createdAt,
    boolean mine,
    Long replyToId,
    String replyToUsername,
    String replyToText
) {}