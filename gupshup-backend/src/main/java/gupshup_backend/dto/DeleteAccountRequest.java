package gupshup_backend.dto;

import jakarta.validation.constraints.*;

public record DeleteAccountRequest(
    @NotBlank(message = "PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "PIN must be exactly 4 digits")
    String passcode
) {}
