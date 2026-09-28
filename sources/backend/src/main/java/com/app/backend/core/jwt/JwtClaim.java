package com.app.backend.core.jwt;

public final class JwtClaim {

    private JwtClaim() {
    }

    // ------------------------------------------------------------------------
    // RFC 7519 Registered Claim Names
    // ------------------------------------------------------------------------

    /** Issuer */
    public static final String ISS = "iss";

    /** Subject (Account ID) */
    public static final String SUB = "sub";

    /** Audience */
    public static final String AUD = "aud";

    /** Expiration Time */
    public static final String EXP = "exp";

    /** Not Before */
    public static final String NBF = "nbf";

    /** Issued At */
    public static final String IAT = "iat";

    /** JWT ID */
    public static final String JTI = "jti";

    // ------------------------------------------------------------------------
    // Private Claim Names
    // ------------------------------------------------------------------------

    /** Userid */
    public static final String USERID = "id";

    /** Username */
    public static final String USERNAME = "username";

}