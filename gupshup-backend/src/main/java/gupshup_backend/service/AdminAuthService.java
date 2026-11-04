package gupshup_backend.service;

import gupshup_backend.entity.AdminAccount;
import gupshup_backend.exception.ApiException;
import gupshup_backend.repository.AdminRepository;
import java.time.Duration;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AdminAuthService {

    private static final int MAX_FAILED = 5;
    private static final Duration LOCK = Duration.ofMinutes(15);
    private static final String BAD = "Invalid credentials";

    private final AdminRepository admins;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AdminAuthService(AdminRepository admins, PasswordEncoder encoder, JwtService jwt) {
        this.admins = admins;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Transactional(noRollbackFor = ApiException.class)
    public String login(String email, String password) {
        AdminAccount a = admins.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, BAD));
        Instant now = Instant.now();

        if (a.getLockedUntil() != null && a.getLockedUntil().isAfter(now)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many wrong attempts. Try again after 15 minutes");
        }
        if (!encoder.matches(password, a.getPasswordHash())) {
            int attempts = a.getFailedAttempts() + 1;
            a.setFailedAttempts(attempts);
            if (attempts >= MAX_FAILED) {
                a.setLockedUntil(now.plus(LOCK));
                a.setFailedAttempts(0);
            }
            admins.save(a);
            throw new ApiException(HttpStatus.UNAUTHORIZED, BAD);
        }
        a.setFailedAttempts(0);
        a.setLockedUntil(null);
        admins.save(a);
        return jwt.createAdminToken(a.getId());
    }
}
