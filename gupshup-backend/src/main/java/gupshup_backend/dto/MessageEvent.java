package gupshup_backend.dto;

public record MessageEvent(
    Long id,
    String username,
    String text,
    String createdAt,
    Long replyToId,
    String replyToUsername,
    String replyToText
) {
    public static MessageEvent from(MessageResponse r) {
        return new MessageEvent(
                r.id(), r.username(), r.text(), r.createdAt().toString(),
                r.replyToId(), r.replyToUsername(), r.replyToText());
    }
}