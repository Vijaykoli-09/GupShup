package gupshup_backend.dto;

import java.time.Instant;

public record AdminUserResponse(
    Long id, String username, String fullName, String city, String phone,
    Instant registeredAt, String status, Instant banUntil
) {}