package com.logistics.config;

import com.logistics.security.JwtProvider;
import io.jsonwebtoken.Claims;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.Collections;

@Component
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private final JwtProvider jwtProvider;

    public WebSocketAuthChannelInterceptor(JwtProvider jwtProvider) {
        this.jwtProvider = jwtProvider;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            String token = null;
            if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7).trim();
            }
            if (!StringUtils.hasText(token)) {
                accessor.setUser(null);
                return message;
            }
            if (!jwtProvider.validateToken(token)) {
                accessor.setUser(null);
                return message;
            }

            Claims claims = jwtProvider.parseToken(token);
            String email = claims.getSubject();
            String role = (String) claims.get("role");
            var authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + role));
            var auth = new UsernamePasswordAuthenticationToken(email, null, authorities);
            accessor.setUser(auth);
        }

        return message;
    }
}

