package gupshup_backend.dto;

import java.time.Instant;

public record ChangeUsernameResponse(String username, Instant nextChangeAt) {}
