package gupshup_backend.controller;

import gupshup_backend.dto.AdminLoginRequest;
import gupshup_backend.dto.AdminLoginResponse;
import gupshup_backend.service.AdminAuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/auth")
public class AdminAuthController {

    private final AdminAuthService auth;

    public AdminAuthController(AdminAuthService auth) {
        this.auth = auth;
    }

    @PostMapping("/login")
    public AdminLoginResponse login(@Valid @RequestBody AdminLoginRequest req) {
        return new AdminLoginResponse(auth.login(req.email(), req.password()));
    }
}
