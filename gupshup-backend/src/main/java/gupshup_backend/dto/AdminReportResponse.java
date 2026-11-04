package gupshup_backend.dto;

import java.time.Instant;

public record AdminReportResponse(
    Long id, Long reportedUserId, String reportedUsername, String reporterUsername,
    String reason, String description, Long messageId, String messageText,
    Instant createdAt, String status
) {}
