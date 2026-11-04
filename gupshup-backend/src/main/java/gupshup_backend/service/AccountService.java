package gupshup_backend.service;

import gupshup_backend.dto.ChangeUsernameResponse;
import gupshup_backend.dto.MeResponse;
import gupshup_backend.entity.User;
import gupshup_backend.entity.UserStatus;
import gupshup_backend.exception.ApiException;
import gupshup_backend.repository.BlockRepository;
import gupshup_backend.repository.MessageRepository;
import gupshup_backend.repository.UserRepository;
import gupshup_backend.util.ChatDay;
import gupshup_backend.util.UsernameGenerator;
import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(noRollbackFor = ApiException.class)
public class AccountService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);
    private static final DateTimeFormatter DATE_FORMAT =
            DateTimeFormatter.ofPattern("d MMM yyyy, h:mm a", Locale.ENGLISH).withZone(ChatDay.IST);

    private final UserRepository users;
    private final MessageRepository messages;
    private final BlockRepository blocks;
    private final PasswordEncoder encoder;
    private final ConsentService consentService;
    private final long cooldownDays;

    public AccountService(UserRepository users, MessageRepository messages, BlockRepository blocks,
                          PasswordEncoder encoder, ConsentService consentService,
                          @Value("${app.username.cooldown-days}") long cooldownDays) {
        this.users = users;
        this.messages = messages;
        this.blocks = blocks;
        this.encoder = encoder;
        this.consentService = consentService;
        this.cooldownDays = cooldownDays;
    }

    @Transactional(readOnly = true)
    public MeResponse getMe(Long userId) {
        User u = activeUser(userId);
        Instant next = nextChange(u);
        boolean canChange = next == null || !next.isAfter(Instant.now());
        return new MeResponse(
                u.getPublicUsername(),
                u.getFirstName(),
                u.getCity(),
                "******" + u.getPhone().substring(6),
                canChange,
                canChange ? null : next,
                consentService.hasAcceptedAll(userId),
                consentService.requiredVersion());
    }

    public ChangeUsernameResponse changeUsername(Long userId) {
        User u = activeUser(userId);
        Instant now = Instant.now();
        Instant next = nextChange(u);
        if (next != null && next.isAfter(now)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "You can change your username again on " + DATE_FORMAT.format(next) + " IST");
        }
        String name;
        do {
            name = UsernameGenerator.generate();
        } while (users.existsByPublicUsername(name));

        u.setPublicUsername(name);
        u.setUsernameChangedAt(now);
        users.save(u);
        return new ChangeUsernameResponse(name, now.plus(Duration.ofDays(cooldownDays)));
    }

    public void changePasscode(Long userId, String currentPasscode, String newPasscode) {
        User u = activeUser(userId);
        verifyPasscode(u, currentPasscode);
        if (encoder.matches(newPasscode, u.getPasscodeHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New PIN must be different from the current PIN");
        }
        u.setPasscodeHash(encoder.encode(newPasscode));
        users.save(u);
    }

    /** Anonymises the account. Returns the ids of deleted messages so the app can be told. */
    public List<Long> deleteAccount(Long userId, String passcode) {
        User u = activeUser(userId);
        verifyPasscode(u, passcode);

        List<Long> deletedMessageIds = messages.findIdsByUserId(userId);
        messages.deleteByUserId(userId);
        blocks.deleteAllInvolving(userId);

        // Keep the row so reports stay valid as moderation evidence, but wipe personal data.
        u.setFirstName("Deleted");
        u.setLastName("User");
        u.setCity("-");
        u.setPhone("D" + String.format("%09d", userId));
        u.setPasscodeHash(null);
        u.setPublicUsername(null);
        u.setBanUntil(null);
        u.setStatus(UserStatus.DELETED);
        users.save(u);
        return deletedMessageIds;
    }

    private Instant nextChange(User u) {
        return u.getUsernameChangedAt() == null
                ? null
                : u.getUsernameChangedAt().plus(Duration.ofDays(cooldownDays));
    }

    private User activeUser(Long userId) {
        return users.findById(userId)
                .filter(u -> u.getStatus() == UserStatus.ACTIVE || u.getStatus() == UserStatus.BANNED)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    /** Same lockout rules as login: 5 wrong PINs lock the account for 15 minutes. */
    private void verifyPasscode(User u, String passcode) {
        Instant now = Instant.now();
        if (u.getLockedUntil() != null && u.getLockedUntil().isAfter(now)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many wrong attempts. Try again after 15 minutes");
        }
        if (!encoder.matches(passcode, u.getPasscodeHash())) {
            int attempts = u.getFailedAttempts() + 1;
            u.setFailedAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                u.setLockedUntil(now.plus(LOCK_DURATION));
                u.setFailedAttempts(0);
            }
            users.save(u);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Incorrect PIN");
        }
        u.setFailedAttempts(0);
        u.setLockedUntil(null);
        users.save(u);
    }
}
