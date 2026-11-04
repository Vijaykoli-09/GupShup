package gupshup_backend.service;

import gupshup_backend.dto.BlockedUserResponse;
import gupshup_backend.dto.ReportRequest;
import gupshup_backend.dto.ReportUserRequest;
import gupshup_backend.entity.Block;
import gupshup_backend.entity.Message;
import gupshup_backend.entity.Report;
import gupshup_backend.entity.User;
import gupshup_backend.exception.ApiException;
import gupshup_backend.repository.BlockRepository;
import gupshup_backend.repository.MessageRepository;
import gupshup_backend.repository.ReportRepository;
import gupshup_backend.repository.UserRepository;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SafetyService {

    private final UserRepository users;
    private final MessageRepository messages;
    private final ReportRepository reports;
    private final BlockRepository blocks;

    public SafetyService(UserRepository users, MessageRepository messages,
                         ReportRepository reports, BlockRepository blocks) {
        this.users = users;
        this.messages = messages;
        this.reports = reports;
        this.blocks = blocks;
    }

    @Transactional
    public void reportMessage(Long reporterId, Long messageId, ReportRequest req) {
        Message m = messages.findById(messageId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Message not found"));
        if (m.getUser().getId().equals(reporterId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot report your own message");
        }
        if (reports.existsByReporterIdAndMessageId(reporterId, messageId)) {
            throw new ApiException(HttpStatus.CONFLICT, "You have already reported this message");
        }
        Report r = new Report();
        r.setReporter(getUser(reporterId));
        r.setReportedUser(m.getUser());
        r.setReportedUsername(m.getUser().getPublicUsername());
        r.setMessageId(m.getId());
        r.setMessageText(m.getText());
        r.setReason(req.reason());
        r.setDescription(clean(req.description()));
        reports.save(r);
    }

    @Transactional
    public void reportUser(Long reporterId, ReportUserRequest req) {
        User target = findByUsername(req.username());
        if (target.getId().equals(reporterId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot report yourself");
        }
        Report r = new Report();
        r.setReporter(getUser(reporterId));
        r.setReportedUser(target);
        r.setReportedUsername(target.getPublicUsername());
        r.setReason(req.reason());
        r.setDescription(clean(req.description()));
        reports.save(r);
    }

    @Transactional
    public void block(Long blockerId, String username) {
        User target = findByUsername(username);
        if (target.getId().equals(blockerId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot block yourself");
        }
        if (blocks.existsByBlockerIdAndBlockedId(blockerId, target.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "User is already blocked");
        }
        Block b = new Block();
        b.setBlockerId(blockerId);
        b.setBlockedId(target.getId());
        blocks.save(b);
    }

    @Transactional
    public void unblock(Long blockerId, Long blockId) {
        Block b = blocks.findByIdAndBlockerId(blockId, blockerId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Blocked user not found"));
        blocks.delete(b);
    }

    @Transactional(readOnly = true)
    public List<BlockedUserResponse> listBlocked(Long blockerId) {
        List<Block> list = blocks.findByBlockerIdOrderByCreatedAtDesc(blockerId);
        Map<Long, String> names = new HashMap<>();
        users.findAllById(list.stream().map(Block::getBlockedId).toList())
                .forEach(u -> names.put(u.getId(), u.getPublicUsername()));
        return list.stream()
                .map(b -> new BlockedUserResponse(b.getId(),
                        names.getOrDefault(b.getBlockedId(), "Unknown user"), b.getCreatedAt()))
                .toList();
    }

    private User getUser(Long id) {
        return users.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    private User findByUsername(String username) {
        return users.findByPublicUsername(username.trim())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private String clean(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}