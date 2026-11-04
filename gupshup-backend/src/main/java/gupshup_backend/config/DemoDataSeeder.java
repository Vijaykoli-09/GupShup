package gupshup_backend.config;

import gupshup_backend.entity.User;
import gupshup_backend.entity.UserStatus;
import gupshup_backend.repository.UserRepository;
import gupshup_backend.util.UsernameGenerator;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoDataSeeder implements CommandLineRunner {

    private final UserRepository users;
    private final PasswordEncoder encoder;

    public DemoDataSeeder(UserRepository users, PasswordEncoder encoder) {
        this.users = users;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) {
        if (users.existsByPhone("9999999999")) return;

        User u = new User();
        u.setFirstName("Demo");
        u.setLastName("User");
        u.setPhone("9999999999");
        u.setCity("Jaysingpur");
        u.setPasscodeHash(encoder.encode("9999"));
        u.setPublicUsername(UsernameGenerator.generate());
        u.setStatus(UserStatus.ACTIVE);
        users.save(u);
    }
}