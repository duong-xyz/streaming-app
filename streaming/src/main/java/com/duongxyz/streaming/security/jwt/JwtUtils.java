package com.duongxyz.streaming.security.jwt;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;
import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtUtils {
    //private final SecretKey jwtSecret = Jwts.SIG.HS256.key().build();
    private final String jwtSecret = "chuoi_bi_mat_sieu_dai_va_an_toan_tren_32_bytes_123456";
    private final int jwtExpirationMs = 900000;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    public String generateJwtToken(String username) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + jwtExpirationMs);
        return Jwts.builder()
                .subject(username)
                .issuedAt(now)
                .expiration(exp)
                .signWith(key())
                .compact();
    }

    public String getUsernameFromJwtToken(String token) {
        return Jwts.parser()
                .verifyWith(key())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parser()
                    .verifyWith(key())
                    .build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (ExpiredJwtException e) {
            System.out.println("===> [JWT ERROR] Token đã hết hạn!");
        } catch (JwtException | IllegalArgumentException e) {
            System.out.println("Lỗi validate JWT: " + e.getMessage());
        }
        return false;
    }
}
