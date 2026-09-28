package com.app.backend.core.jwt;

import com.app.backend.configs.JwtConfig;
import com.app.backend.entities.Account;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtConfig jwtConfig;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(
                jwtConfig.getSecret().getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(Account account) {
        Instant now = Instant.now();
        return Jwts.builder()
                .issuer(jwtConfig.getIssuer())
                .subject(account.getId().toString())
                .issuedAt(Date.from(now))
                .notBefore(Date.from(now))
                .expiration(Date.from(now.plusMillis(jwtConfig.getExpiration())))
                .id(UUID.randomUUID().toString())
                .claim(JwtClaim.USERID, account.getId().toString())
                .claim(JwtClaim.USERNAME, account.getUsername())
                .signWith(getSigningKey())
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}