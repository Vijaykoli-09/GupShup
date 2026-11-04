package gupshup_backend.dto;

import jakarta.validation.constraints.*;

public record ConsentRequest(
    @NotBlank(message = "Version is required")
    String version,

    @AssertTrue(message = "You must accept the Privacy Policy")
    boolean privacyPolicy,

    @AssertTrue(message = "You must accept the Community Guidelines")
    boolean communityGuidelines,

    @AssertTrue(message = "You must accept the Terms and Conditions")
    boolean terms
) {}
