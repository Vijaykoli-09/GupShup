package gupshup_backend.entity;

import java.time.Duration;

public enum BanDuration {
    HOUR_1(Duration.ofHours(1)),
    HOURS_24(Duration.ofHours(24)),
    DAYS_7(Duration.ofDays(7)),
    DAYS_30(Duration.ofDays(30)),
    PERMANENT(null);

    private final Duration duration;

    BanDuration(Duration duration) { this.duration = duration; }

    /** null means permanent. */
    public Duration getDuration() { return duration; }
}
