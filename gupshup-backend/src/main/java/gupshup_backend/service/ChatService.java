package gupshup_backend.service;

import gupshup_backend.dto.MessageResponse;
import gupshup_backend.dto.SendMessageRequest;
import gupshup_backend.entity.Message;
import gupshup_backend.entity.User;
import gupshup_backend.entity.UserStatus;
import gupshup_backend.exception.ApiException;
import gupshup_backend.repository.BlockRepository;
import gupshup_backend.repository.MessageRepository;
import gupshup_backend.repository.UserRepository;
import gupshup_backend.util.ChatDay;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class ChatService {

    private final MessageRepository messages;
    private final UserRepository users;
    private final BlockRepository blocks;
    private final long slowModeSeconds;
    private final ConsentService consentService;


 public ChatService(MessageRepository messages, UserRepository users, BlockRepository blocks,
                   ConsentService consentService,
                   @Value("${app.chat.slow-mode-seconds}") long slowModeSeconds) {
    this.messages = messages;
    this.users = users;
    this.blocks = blocks;
    this.consentService = consentService;
    this.slowModeSeconds = slowModeSeconds;
}

    /** Only messages of the current chat day, without messages from blocked users. */
    @Transactional(readOnly = true)
    public List<MessageResponse> getMessages(Long userId) {
        LocalDate day = ChatDay.current();
        Set<Long> blocked = new HashSet<>(blocks.findBlockedIds(userId));
        List<Message> list = messages.findByChatDayOrderByCreatedAtAsc(day);

        Map<Long, Message> byId = new HashMap<>();
        list.forEach(m -> byId.put(m.getId(), m));

        return list.stream()
                .filter(m -> !blocked.contains(m.getUser().getId()))
                .map(m -> {
                    Message reply = m.getReplyToId() == null ? null : byId.get(m.getReplyToId());
                    if (reply != null && blocked.contains(reply.getUser().getId())) {
                        reply = null;
                    }
                    return toResponse(m, userId, reply);
                })
                .toList();
    }

    @Transactional
    public MessageResponse send(Long userId, SendMessageRequest req) {
        User user = users.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        Instant now = Instant.now();

        if (user.getStatus() != UserStatus.ACTIVE && user.getStatus() != UserStatus.BANNED) {
    throw new ApiException(HttpStatus.UNAUTHORIZED, "Account is not active");
}
if (!consentService.hasAcceptedAll(userId)) {
    throw new ApiException(HttpStatus.FORBIDDEN,
            "Please accept the Privacy Policy, Community Guidelines and Terms first");
}

        if (user.getStatus() == UserStatus.BANNED
                && (user.getBanUntil() == null || user.getBanUntil().isAfter(now))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is banned");
        }

        messages.findTopByUserIdOrderByCreatedAtDesc(userId).ifPresent(last -> {
            long elapsed = Duration.between(last.getCreatedAt(), now).toMillis();
            long waitMs = slowModeSeconds * 1000 - elapsed;
            if (waitMs > 0) {
                long secs = (waitMs + 999) / 1000;
                throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                        "Slow mode: wait " + secs + " second(s) before sending again");
            }
        });

        LocalDate day = ChatDay.of(now);
        Message reply = null;
        if (req.replyToId() != null) {
            reply = messages.findById(req.replyToId())
                    .filter(m -> m.getChatDay().equals(day))
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST,
                            "The message you are replying to is no longer available"));
        }

        Message m = new Message();
        m.setUser(user);
        m.setText(req.text().trim());
        m.setChatDay(day);
        m.setCreatedAt(now);
        m.setReplyToId(reply != null ? reply.getId() : null);
        messages.save(m);

        return toResponse(m, userId, reply);
    }

    @Transactional
    public void delete(Long userId, Long messageId) {
        Message m = messages.findById(messageId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Message not found"));
        if (!m.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can delete only your own messages");
        }
        messages.delete(m);
    }

    /** Removes all messages from previous chat days. */
    @Transactional
    public int clearExpiredMessages() {
        return messages.deleteOlderThan(ChatDay.current());
    }

    private MessageResponse toResponse(Message m, Long viewerId, Message reply) {
        String preview = null;
        if (reply != null) {
            preview = reply.getText().length() > 80
                    ? reply.getText().substring(0, 80) + "..."
                    : reply.getText();
        }
        return new MessageResponse(
                m.getId(),
                m.getUser().getPublicUsername(),
                m.getText(),
                m.getCreatedAt(),
                m.getUser().getId().equals(viewerId),
                reply != null ? reply.getId() : null,
                reply != null ? reply.getUser().getPublicUsername() : null,
                preview);
    }

    
}