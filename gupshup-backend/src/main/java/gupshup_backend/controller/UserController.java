package gupshup_backend.controller;

import gupshup_backend.dto.ChangePasscodeRequest;
import gupshup_backend.dto.ChangeUsernameResponse;
import gupshup_backend.dto.ConsentRequest;
import gupshup_backend.dto.ConsentStatusResponse;
import gupshup_backend.dto.DeleteAccountRequest;
import gupshup_backend.dto.MeResponse;
import gupshup_backend.service.AccountService;
import gupshup_backend.service.ConsentService;
import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final AccountService accounts;
    private final ConsentService consents;
    private final SimpMessagingTemplate broker;

    public UserController(AccountService accounts, ConsentService consents, SimpMessagingTemplate broker) {
        this.accounts = accounts;
        this.consents = consents;
        this.broker = broker;
    }

    @GetMapping("/me")
    public MeResponse me(Authentication auth) {
        return accounts.getMe((Long) auth.getPrincipal());
    }

    @PostMapping("/me/username")
    public ChangeUsernameResponse changeUsername(Authentication auth) {
        return accounts.changeUsername((Long) auth.getPrincipal());
    }

    @PutMapping("/me/passcode")
    public Map<String, String> changePasscode(Authentication auth,
                                              @Valid @RequestBody ChangePasscodeRequest req) {
        accounts.changePasscode((Long) auth.getPrincipal(), req.currentPasscode(), req.newPasscode());
        return Map.of("message", "PIN changed successfully");
    }

    @PostMapping("/me/delete")
    public Map<String, String> deleteAccount(Authentication auth,
                                             @Valid @RequestBody DeleteAccountRequest req) {
        List<Long> deletedIds = accounts.deleteAccount((Long) auth.getPrincipal(), req.passcode());
        for (Long id : deletedIds) {
            broker.convertAndSend("/topic/chat.deleted", (Object) Map.of("id", id));
        }
        return Map.of("message", "Account deleted");
    }

    @GetMapping("/me/consent")
    public ConsentStatusResponse consentStatus(Authentication auth) {
        return consents.status((Long) auth.getPrincipal());
    }

    @PostMapping("/me/consent")
    public Map<String, String> acceptConsent(Authentication auth, @Valid @RequestBody ConsentRequest req) {
        consents.acceptAll((Long) auth.getPrincipal(), req);
        return Map.of("message", "Consent recorded");
    }
}