package com.app.backend.core.jwt;

import io.jsonwebtoken.Claims;

public final class JwtUtil {

    private JwtUtil() {
    }

    /**
     * Account Id.
     */
    public static Long getAccountId(Claims claims) {

        String value = claims.getSubject();

        return value == null ? null : Long.valueOf(value);
    }

    /**
     * Username.
     */
    public static String getUsername(Claims claims) {

        return claims.get(JwtClaim.USERNAME, String.class);
    }
}