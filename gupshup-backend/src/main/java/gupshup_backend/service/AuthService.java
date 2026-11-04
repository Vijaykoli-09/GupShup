package gupshup_backend.service;

import gupshup_backend.dto.LoginRequest;
import gupshup_backend.dto.LoginResponse;
import gupshup_backend.dto.RegisterRequest;
import gupshup_backend.dto.SetPasscodeRequest;
import gupshup_backend.dto.VerifyOtpRequest;
import gupshup_backend.entity.User;
import gupshup_backend.entity.UserStatus;
import gupshup_backend.exception.ApiException;
import gupshup_backend.repository.UserRepository;
import gupshup_backend.util.UsernameGenerator;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import java.time.Duration;
import java.time.Instant;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final Duration LOCK_DURATION = Duration.ofMinutes(15);
    private static final String BAD_CREDENTIALS = "Incorrect mobile number or PIN";

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final OtpService otpService;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder encoder,
                       OtpService otpService, JwtService jwtService) {
        this.users = users;
        this.encoder = encoder;
        this.otpService = otpService;
        this.jwtService = jwtService;
    }

    /** Step 1: save pending user and send OTP. */
    @Transactional
    public void register(RegisterRequest req) {
        User user = users.findByPhone(req.phone()).orElse(null);
        if (user != null && user.getStatus() != UserStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "This number is already registered");
        }
        if (user == null) {
            user = new User();
            user.setPhone(req.phone());
        }
        user.setFirstName(req.firstName().trim());
        user.setLastName(req.lastName().trim());
        user.setCity(req.city().trim());
        users.save(user);
        otpService.sendOtp(req.phone());
    }

    /** Step 2: verify OTP and return a short-lived registration token. */
    @Transactional(readOnly = true)
    public String verifyOtp(VerifyOtpRequest req) {
        User user = users.findByPhone(req.phone())
            .filter(u -> u.getStatus() == UserStatus.ACTIVE || u.getStatus() == UserStatus.BANNED)                
            .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Please register first"));
        if (!otpService.verifyOtp(req.phone(), req.otp())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Incorrect OTP. Please try again");
        }
        return jwtService.createRegistrationToken(user.getId());
    }

    /** Step 3: hash passcode, create public username, activate account. */
    @Transactional
    public void setPasscode(SetPasscodeRequest req) {
        Claims claims;
        try {
            claims = jwtService.parse(req.registrationToken());
        } catch (JwtException | IllegalArgumentException e) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Session expired. Please verify OTP again");
        }
        if (!JwtService.REGISTRATION.equals(claims.get("purpose", String.class))) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid registration token");
        }
        User user = users.findById(Long.valueOf(claims.getSubject()))
                .filter(u -> u.getStatus() == UserStatus.ACTIVE || u.getStatus() == UserStatus.BANNED)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "Registration already completed"));

        user.setPasscodeHash(encoder.encode(req.passcode()));
        user.setPublicUsername(generateUniqueUsername());
        user.setStatus(UserStatus.ACTIVE);
        users.save(user);
    }

    /** Step 4: login with phone and PIN. */
    @Transactional(noRollbackFor = ApiException.class)
    public LoginResponse login(LoginRequest req) {
        User user = users.findByPhone(req.phone())
                .filter(u -> u.getStatus() == UserStatus.ACTIVE || u.getStatus() == UserStatus.BANNED)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, BAD_CREDENTIALS));

        Instant now = Instant.now();

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS,
                    "Too many wrong attempts. Try again after 15 minutes");
        }

        if (!encoder.matches(req.passcode(), user.getPasscodeHash())) {
            int attempts = user.getFailedAttempts() + 1;
            user.setFailedAttempts(attempts);
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockedUntil(now.plus(LOCK_DURATION));
                user.setFailedAttempts(0);
            }
            users.save(user);
            throw new ApiException(HttpStatus.UNAUTHORIZED, BAD_CREDENTIALS);
        }

        if (user.getStatus() == UserStatus.BANNED
                && (user.getBanUntil() == null || user.getBanUntil().isAfter(now))) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Your account is banned");
        }

        user.setFailedAttempts(0);
        user.setLockedUntil(null);
        users.save(user);

        return new LoginResponse(jwtService.createAccessToken(user.getId()), user.getPublicUsername());
    }

    private String generateUniqueUsername() {
        String name;
        do {
            name = UsernameGenerator.generate();
        } while (users.existsByPublicUsername(name));
        return name;
    }
}