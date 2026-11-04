package gupshup_backend.dto;

import jakarta.validation.constraints.*;

public record SendMessageRequest(
    @NotBlank(message = "Message cannot be empty")
    @Size(max = 500, message = "Message can be at most 500 characters")
    String text,

    Long replyToId
) {}