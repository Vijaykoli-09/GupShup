package gupshup_backend.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;

public final class ChatDay {

    public static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    public static final LocalTime RESET_TIME = LocalTime.of(3, 0);

    private ChatDay() {}

    /** Before 03:00 IST the chat day is yesterday; from 03:00 it is today. */
    public static LocalDate of(Instant instant) {
        ZonedDateTime z = instant.atZone(IST);
        return z.toLocalTime().isBefore(RESET_TIME)
                ? z.toLocalDate().minusDays(1)
                : z.toLocalDate();
    }

    public static LocalDate current() {
        return of(Instant.now());
    }
}