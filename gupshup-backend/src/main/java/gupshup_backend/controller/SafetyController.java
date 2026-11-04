package gupshup_backend.controller;

import gupshup_backend.dto.BlockRequest;
import gupshup_backend.dto.BlockedUserResponse;
import gupshup_backend.dto.ReportRequest;
import gupshup_backend.dto.ReportUserRequest;
import gupshup_backend.service.SafetyService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/safety")
public class SafetyController {

    private final SafetyService safety;

    public SafetyController(SafetyService safety) {
        this.safety = safety;
    }

    @PostMapping("/messages/{messageId}/report")
    public Map<String, String> reportMessage(Authentication auth, @PathVariable Long messageId,
                                             @Valid @RequestBody ReportRequest req) {
        safety.reportMessage((Long) auth.getPrincipal(), messageId, req);
        return Map.of("message", "Report submitted. Thank you");
    }

    @PostMapping("/users/report")
    public Map<String, String> reportUser(Authentication auth, @Valid @RequestBody ReportUserRequest req) {
        safety.reportUser((Long) auth.getPrincipal(), req);
        return Map.of("message", "Report submitted. Thank you");
    }

    @PostMapping("/blocks")
    public Map<String, String> block(Authentication auth, @Valid @RequestBody BlockRequest req) {
        safety.block((Long) auth.getPrincipal(), req.username());
        return Map.of("message", "User blocked");
    }

    @GetMapping("/blocks")
    public List<BlockedUserResponse> blocked(Authentication auth) {
        return safety.listBlocked((Long) auth.getPrincipal());
    }

    @DeleteMapping("/blocks/{blockId}")
    public Map<String, String> unblock(Authentication auth, @PathVariable Long blockId) {
        safety.unblock((Long) auth.getPrincipal(), blockId);
        return Map.of("message", "User unblocked");
    }
}