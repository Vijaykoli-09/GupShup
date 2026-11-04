package gupshup_backend.dto;

import java.time.Instant;

public record BlockedUserResponse(Long blockId, String username, Instant blockedAt) {}