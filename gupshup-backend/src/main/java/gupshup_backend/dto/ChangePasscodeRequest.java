package gupshup_backend.dto;

import jakarta.validation.constraints.*;

public record ChangePasscodeRequest(
    @NotBlank(message = "Current PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "Current PIN must be exactly 4 digits")
    String currentPasscode,

    @NotBlank(message = "New PIN is required")
    @Pattern(regexp = "^\\d{4}$", message = "New PIN must be exactly 4 digits")
    String newPasscode
) {}
