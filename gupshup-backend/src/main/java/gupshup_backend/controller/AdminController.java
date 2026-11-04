package gupshup_backend.controller;

import gupshup_backend.dto.*;
import gupshup_backend.entity.ReportStatus;
import gupshup_backend.service.AdminService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService admin;
    private final SimpMessagingTemplate broker;

    public AdminController(AdminService admin, SimpMessagingTemplate broker) {
        this.admin = admin;
        this.broker = broker;
    }

    @GetMapping("/dashboard")
    public DashboardStats dashboard() {
        return admin.stats();
    }

    @GetMapping("/users")
    public List<AdminUserResponse> users(@RequestParam(defaultValue = "") String search) {
        return admin.listUsers(search);
    }

    @PostMapping("/users/{id}/ban")
    public Map<String, String> ban(@PathVariable Long id, @Valid @RequestBody BanRequest req) {
        admin.ban(id, req.duration());
        return Map.of("message", "User banned");
    }

    @PostMapping("/users/{id}/unban")
    public Map<String, String> unban(@PathVariable Long id) {
        admin.unban(id);
        return Map.of("message", "User unbanned");
    }

    @GetMapping("/reports")
    public List<AdminReportResponse> reports(@RequestParam(required = false) String status) {
        return admin.listReports(status);
    }

    @PostMapping("/reports/{id}/review")
    public Map<String, String> review(@PathVariable Long id) {
        admin.setReportStatus(id, ReportStatus.REVIEWED);
        return Map.of("message", "Report updated");
    }

    @PostMapping("/reports/{id}/dismiss")
    public Map<String, String> dismiss(@PathVariable Long id) {
        admin.setReportStatus(id, ReportStatus.DISMISSED);
        return Map.of("message", "Report updated");
    }

    @GetMapping("/messages")
    public List<AdminMessageResponse> messages(@RequestParam(defaultValue = "") String search) {
        return admin.listMessages(search);
    }

    @DeleteMapping("/messages/{id}")
    public Map<String, String> deleteMessage(@PathVariable Long id) {
        admin.deleteMessage(id);
        broker.convertAndSend("/topic/chat.deleted", (Object) Map.of("id", id));
        return Map.of("message", "Message deleted");
    }
}
