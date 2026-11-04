package gupshup_backend.dto;

import gupshup_backend.entity.ReportReason;
import jakarta.validation.constraints.*;

public record ReportRequest(
    @NotNull(message = "Please select a reason")
    ReportReason reason,

    @Size(max = 300, message = "Description can be at most 300 characters")
    String description
) {}