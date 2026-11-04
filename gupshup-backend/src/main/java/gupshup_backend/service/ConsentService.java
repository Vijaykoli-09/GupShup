package gupshup_backend.service;

import gupshup_backend.dto.ConsentRequest;
import gupshup_backend.dto.ConsentStatusResponse;
import gupshup_backend.entity.Consent;
import gupshup_backend.entity.ConsentDocument;
import gupshup_backend.exception.ApiException;
import gupshup_backend.repository.ConsentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ConsentService {

    private final ConsentRepository consents;
    private final String requiredVersion;

    public ConsentService(ConsentRepository consents,
                          @Value("${app.legal.version}") String requiredVersion) {
        this.consents = consents;
        this.requiredVersion = requiredVersion;
    }

    public String requiredVersion() {
        return requiredVersion;
    }

    @Transactional(readOnly = true)
    public boolean hasAcceptedAll(Long userId) {
        return consents.countByUserIdAndVersion(userId, requiredVersion) >= ConsentDocument.values().length;
    }

    @Transactional(readOnly = true)
    public ConsentStatusResponse status(Long userId) {
        return new ConsentStatusResponse(hasAcceptedAll(userId), requiredVersion);
    }

    @Transactional
    public void acceptAll(Long userId, ConsentRequest req) {
        if (!requiredVersion.equals(req.version())) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Please accept the latest version (" + requiredVersion + ")");
        }
        for (ConsentDocument doc : ConsentDocument.values()) {
            if (!consents.existsByUserIdAndDocumentTypeAndVersion(userId, doc, requiredVersion)) {
                Consent c = new Consent();
                c.setUserId(userId);
                c.setDocumentType(doc);
                c.setVersion(requiredVersion);
                consents.save(c);
            }
        }
    }
}
