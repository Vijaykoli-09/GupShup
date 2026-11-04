package gupshup_backend.controller;

import gupshup_backend.dto.MessageEvent;
import gupshup_backend.dto.MessageResponse;
import gupshup_backend.dto.SendMessageRequest;
import gupshup_backend.service.ChatService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate broker;

    public ChatController(ChatService chatService, SimpMessagingTemplate broker) {
        this.chatService = chatService;
        this.broker = broker;
    }

    @GetMapping("/messages")
    public List<MessageResponse> messages(Authentication auth) {
        return chatService.getMessages((Long) auth.getPrincipal());
    }

    @PostMapping("/messages")
    public MessageResponse send(Authentication auth, @Valid @RequestBody SendMessageRequest req) {
        MessageResponse saved = chatService.send((Long) auth.getPrincipal(), req);
        // The service transaction has committed by now, so the message is safe to broadcast.
        broker.convertAndSend("/topic/chat", MessageEvent.from(saved));
        return saved;
    }

    @DeleteMapping("/messages/{id}")
    public Map<String, String> delete(Authentication auth, @PathVariable Long id) {
        chatService.delete((Long) auth.getPrincipal(), id);
        broker.convertAndSend("/topic/chat.deleted", (Object) Map.of("id", id));
        return Map.of("message", "Message deleted");
}
}