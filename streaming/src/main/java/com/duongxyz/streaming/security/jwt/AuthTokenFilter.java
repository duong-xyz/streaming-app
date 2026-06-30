package com.duongxyz.streaming.security.jwt;

import com.duongxyz.streaming.security.CustomUserDetailsService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AuthTokenFilter extends OncePerRequestFilter {
    private final JwtUtils jwtUtils;
    private final CustomUserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal
            (HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // =========================================================================
        // LOG BẮT BỆNH 1: Kiểm tra phương thức và đường dẫn API nhận được
        // =========================================================================
        String path = request.getRequestURI();
        String method = request.getMethod();
        System.out.println("\n===> [FILTER INCOMING] Method: " + method + " | Path: " + path);

        try {
            String jwt = parseJwt(request);

            // Log giá trị token thô nhận được từ Request Header
            System.out.println("===> [FILTER JWT RAW]: " + (jwt != null ? "Tìm thấy chuỗi Token" : "KHÔNG TÌM THẤY TOKEN (NULL)"));

            if(jwt != null && jwtUtils.validateJwtToken(jwt)) {
                String username = jwtUtils.getUsernameFromJwtToken(jwt);
                UserDetails userDetails = userDetailsService.loadUserByUsername(username);

                UsernamePasswordAuthenticationToken authentication =
                        new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);

                // Log quyền hạn thực tế được nạp vào hệ thống
                System.out.println("===> [FILTER SUCCESS] User: " + username + " | Quyền hạn: " + userDetails.getAuthorities());
            } else if (jwt != null) {
                System.out.println("===> [FILTER WARN] Token hợp lệ cấu trúc nhưng Validate thất bại (Hết hạn hoặc sai Key)!");
            }
        } catch (Exception e) {
            System.err.println("===> [FILTER EXCEPTION] Lỗi nghiêm trọng tại bộ lọc: " + e.getMessage());
            logger.error("Authentication Error", e);
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        org.springframework.util.AntPathMatcher pathMatcher = new org.springframework.util.AntPathMatcher();
        return pathMatcher.match("/api/v1/users/login", path)
            || pathMatcher.match("/api/v1/users/register", path);
    }

    private String parseJwt(HttpServletRequest request) {
        String headerAuth = request.getHeader("Authorization");

        // In ra log để xem Trình duyệt gửi chữ viết hoa hay viết thường
        if (headerAuth == null) {
            // Thử tìm bằng chữ thường xem Trình duyệt Axios có ép kiểu về lowercase không
            headerAuth = request.getHeader("authorization");
            if (headerAuth != null) {
                System.out.println("===> [FILTER NOTE] Phát hiện trình duyệt ép Header về chữ thường: 'authorization'");
            }
        }

        if(StringUtils.hasText(headerAuth) && headerAuth.startsWith("Bearer ")) {
            return headerAuth.substring(7);
        }
        return null;
    }
}
