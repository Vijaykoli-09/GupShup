package gupshup_backend.dto;

import jakarta.validation.constraints.NotBlank;

public record BlockRequest(
    @NotBlank(message = "Username is required")
    String username
) {}