package gupshup_backend.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    public static final String ACCESS = "ACCESS";
    public static final String REGISTRATION = "REGISTRATION";
    public static final String ADMIN = "ADMIN";

    private final SecretKey key;
    private final long accessMinutes;

    public JwtService(@Value("${app.jwt.secret}") String secret,
                      @Value("${app.jwt.access-minutes}") long accessMinutes) {
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessMinutes = accessMinutes;
    }

    public String createAccessToken(Long userId) {
        return build(userId, ACCESS, Duration.ofMinutes(accessMinutes));
    }

    public String createRegistrationToken(Long userId) {
        return build(userId, REGISTRATION, Duration.ofMinutes(10));
    }

    public String createAdminToken(Long adminId) {
        return build(adminId, ADMIN, Duration.ofHours(8));
    }

    private String build(Long userId, String purpose, Duration validFor) {
        Date now = new Date();
        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("purpose", purpose)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + validFor.toMillis()))
                .signWith(key)
                .compact();
    }

    /** Throws JwtException if invalid or expired. */
    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
    }
}