package gupshup_backend.config;

import gupshup_backend.entity.AdminAccount;
import gupshup_backend.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final AdminRepository admins;
    private final PasswordEncoder encoder;
    private final String email;
    private final String password;

    public AdminSeeder(AdminRepository admins, PasswordEncoder encoder,
                       @Value("${app.admin.email}") String email,
                       @Value("${app.admin.password}") String password) {
        this.admins = admins;
        this.encoder = encoder;
        this.email = email.trim().toLowerCase();
        this.password = password;
    }

    @Override
    public void run(String... args) {
        if (admins.existsByEmail(email)) return;
        AdminAccount a = new AdminAccount();
        a.setEmail(email);
        a.setPasswordHash(encoder.encode(password));
        admins.save(a);
    }
}
