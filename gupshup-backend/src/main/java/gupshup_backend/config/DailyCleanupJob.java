package gupshup_backend.config;

import gupshup_backend.service.ChatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class DailyCleanupJob {

    private static final Logger log = LoggerFactory.getLogger(DailyCleanupJob.class);
    private final ChatService chatService;

    public DailyCleanupJob(ChatService chatService) {
        this.chatService = chatService;
    }

    @Scheduled(cron = "0 5 3 * * *", zone = "Asia/Kolkata")
    public void dailyCleanup() {
        run("scheduled");
    }

    @EventListener(ApplicationReadyEvent.class)
    public void catchUpOnStartup() {
        run("startup catch-up");
    }

    private void run(String reason) {
        int deleted = chatService.clearExpiredMessages();
        log.info("Chat cleanup ({}): removed {} old messages", reason, deleted);
    }
}