package gupshup_backend.dto;

import java.time.Instant;

public record AdminMessageResponse(
    Long id, String username, String text, Instant createdAt, long reportCount
) {}
