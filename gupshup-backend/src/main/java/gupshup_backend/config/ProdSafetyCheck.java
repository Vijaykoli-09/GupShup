package gupshup_backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

@Component
@Profile("prod")
public class ProdSafetyCheck {

    public ProdSafetyCheck(@Value("${app.jwt.secret}") String jwtSecret,
                           @Value("${app.admin.password}") String adminPassword,
                           @Value("${app.demo.seed}") boolean demoSeed,
                           @Value("${app.cors.allowed-origins}") String origins) {
        if (jwtSecret.length() < 32 || jwtSecret.contains("change-me")) {
            throw new IllegalStateException("JWT_SECRET is missing, too short, or still the dev default");
        }
        if (adminPassword.length() < 10 || adminPassword.equals("admin123")) {
            throw new IllegalStateException("ADMIN_PASSWORD is too weak");
        }
        if (demoSeed) {
            throw new IllegalStateException("Demo data must be disabled in production");
        }
        if (origins.contains("localhost")) {
            throw new IllegalStateException("CORS_ORIGINS must not contain localhost in production");
        }
    }
}