package gupshup_backend.config;

import gupshup_backend.service.JwtService;
import io.jsonwebtoken.Claims;
import java.util.List;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Component;

@Component
public class StompAuthInterceptor implements ChannelInterceptor {

    private final JwtService jwtService;

    public StompAuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor acc = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (acc == null) return message;

        if (StompCommand.CONNECT.equals(acc.getCommand())) {
            String header = acc.getFirstNativeHeader("Authorization");
            if (header == null || !header.startsWith("Bearer ")) {
                throw new MessagingException("Unauthorized");
            }
            try {
                Claims claims = jwtService.parse(header.substring(7));
                if (!JwtService.ACCESS.equals(claims.get("purpose", String.class))) {
                    throw new MessagingException("Unauthorized");
                }
                Long userId = Long.valueOf(claims.getSubject());
                acc.setUser(new UsernamePasswordAuthenticationToken(userId, null, List.of()));
            } catch (MessagingException e) {
                throw e;
            } catch (Exception e) {
                throw new MessagingException("Unauthorized");
            }
        } else if (StompCommand.SUBSCRIBE.equals(acc.getCommand()) && acc.getUser() == null) {
            throw new MessagingException("Unauthorized");
        }
        return message;
    }
}