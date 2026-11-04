package gupshup_backend.dto;

public record DashboardStats(
    long totalUsers, long activeUsers, long messagesToday, long pendingReports, long bannedUsers
) {}
