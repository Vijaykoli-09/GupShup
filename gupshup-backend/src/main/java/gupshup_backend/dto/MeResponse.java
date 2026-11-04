package gupshup_backend.dto;

import java.time.Instant;

public record MeResponse(
    String publicUsername,
    String firstName,
    String city,
    String maskedPhone,
    boolean canChangeUsername,
    Instant nextUsernameChangeAt,
    boolean consentAccepted,
    String requiredLegalVersion
) {}
