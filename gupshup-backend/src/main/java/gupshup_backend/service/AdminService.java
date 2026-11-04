package gupshup_backend.service;

import gupshup_backend.dto.*;
import gupshup_backend.entity.*;
import gupshup_backend.exception.ApiException;
import gupshup_backend.repository.MessageRepository;
import gupshup_backend.repository.ReportRepository;
import gupshup_backend.repository.UserRepository;
import gupshup_backend.util.ChatDay;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AdminService {

    private static final List<UserStatus> LIVE = List.of(UserStatus.ACTIVE, UserStatus.BANNED);

    private final UserRepository users;
    private final MessageRepository messages;
    private final ReportRepository reports;

    public AdminService(UserRepository users, MessageRepository messages, ReportRepository reports) {
        this.users = users;
        this.messages = messages;
        this.reports = reports;
    }

    // ---------- Dashboard ----------
    @Transactional(readOnly = true)
    public DashboardStats stats() {
        long total = users.countByStatusIn(LIVE);
        long banned = users.countActiveBans(UserStatus.BANNED, Instant.now());
        return new DashboardStats(
                total, total - banned,
                messages.countByChatDay(ChatDay.current()),
                reports.countByStatus(ReportStatus.PENDING),
                banned);
    }

    // ---------- Users ----------
    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers(String search) {
        Instant now = Instant.now();
        return users.search(LIVE, clean(search)).stream().map(u -> {
            boolean banned = isBanned(u, now);
            return new AdminUserResponse(
                    u.getId(), u.getPublicUsername(),
                    u.getFirstName() + " " + u.getLastName(),
                    u.getCity(),
                    u.getPhone(),
                    u.getCreatedAt(),
                    banned ? "BANNED" : "ACTIVE",
                    banned ? u.getBanUntil() : null);
        }).toList();
    }

    public void ban(Long userId, BanDuration duration) {
        User u = liveUser(userId);
        u.setStatus(UserStatus.BANNED);
        u.setBanUntil(duration.getDuration() == null ? null : Instant.now().plus(duration.getDuration()));
        users.save(u);
    }

    public void unban(Long userId) {
        User u = liveUser(userId);
        u.setStatus(UserStatus.ACTIVE);
        u.setBanUntil(null);
        users.save(u);
    }

    // ---------- Reports ----------
    @Transactional(readOnly = true)
    public List<AdminReportResponse> listReports(String status) {
        List<Report> list;
        if (status == null || status.isBlank()) {
            list = reports.findAllByOrderByCreatedAtDesc();
        } else {
            try {
                list = reports.findByStatusOrderByCreatedAtDesc(ReportStatus.valueOf(status.toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid status");
            }
        }
        Set<Long> ids = list.stream().map(Report::getMessageId)
                .filter(Objects::nonNull).collect(Collectors.toSet());
        Set<Long> existing = ids.isEmpty() ? Set.of() : new HashSet<>(messages.findExistingIds(ids));

        return list.stream().map(r -> new AdminReportResponse(
                r.getId(),
                r.getReportedUser().getId(),
                r.getReportedUsername(),
                r.getReporter().getPublicUsername() != null ? r.getReporter().getPublicUsername() : "Deleted user",
                r.getReason().name(),
                r.getDescription(),
                r.getMessageId() != null && existing.contains(r.getMessageId()) ? r.getMessageId() : null,
                r.getMessageText(),
                r.getCreatedAt(),
                r.getStatus().name())).toList();
    }

    public void setReportStatus(Long reportId, ReportStatus status) {
        Report r = reports.findById(reportId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Report not found"));
        r.setStatus(status);
        reports.save(r);
    }

    // ---------- Messages ----------
    @Transactional(readOnly = true)
    public List<AdminMessageResponse> listMessages(String search) {
        List<Message> list = messages.searchByChatDay(ChatDay.current(), clean(search));
        Map<Long, Long> counts = new HashMap<>();
        if (!list.isEmpty()) {
            for (Object[] row : reports.countByMessageIds(list.stream().map(Message::getId).toList())) {
                counts.put((Long) row[0], (Long) row[1]);
            }
        }
        return list.stream().map(m -> new AdminMessageResponse(
                m.getId(), m.getUser().getPublicUsername(), m.getText(),
                m.getCreatedAt(), counts.getOrDefault(m.getId(), 0L))).toList();
    }

    public void deleteMessage(Long id) {
        if (!messages.existsById(id)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Message not found");
        }
        messages.deleteById(id); // reports keep their own copy of the text
    }

    // ---------- helpers ----------
    private boolean isBanned(User u, Instant now) {
        return u.getStatus() == UserStatus.BANNED
                && (u.getBanUntil() == null || u.getBanUntil().isAfter(now));
    }

    private User liveUser(Long id) {
        return users.findById(id)
                .filter(u -> u.getStatus() == UserStatus.ACTIVE || u.getStatus() == UserStatus.BANNED)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private String clean(String s) {
        if (s == null) return "";
        s = s.trim();
        return s.length() > 50 ? s.substring(0, 50) : s;
    }
}