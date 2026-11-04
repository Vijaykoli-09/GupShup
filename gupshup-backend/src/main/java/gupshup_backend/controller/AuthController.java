package gupshup_backend.controller;

import gupshup_backend.dto.LoginRequest;
import gupshup_backend.dto.LoginResponse;
import gupshup_backend.dto.RegisterRequest;
import gupshup_backend.dto.SetPasscodeRequest;
import gupshup_backend.dto.VerifyOtpRequest;
import gupshup_backend.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public Map<String, String> register(@Valid @RequestBody RegisterRequest req) {
        authService.register(req);
        return Map.of("message", "OTP sent");
    }

    @PostMapping("/verify-otp")
    public Map<String, String> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        return Map.of("registrationToken", authService.verifyOtp(req));
    }

    @PostMapping("/set-passcode")
    public Map<String, String> setPasscode(@Valid @RequestBody SetPasscodeRequest req) {
        authService.setPasscode(req);
        return Map.of("message", "Account created. Please login");
    }

    @PostMapping("/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest req) {
        return authService.login(req);
    }
}