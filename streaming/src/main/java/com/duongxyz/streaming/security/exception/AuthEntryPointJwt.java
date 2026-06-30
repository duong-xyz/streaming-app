package com.duongxyz.streaming.security.exception;

import com.duongxyz.streaming.exception.ErrorResponse;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

public class AuthEntryPointJwt implements AuthenticationEntryPoint {
    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response,
                         AuthenticationException authException) throws IOException, ServletException {
        // 1. Cấu hình HTTP Header sử dụng HttpStatus chuẩn của Spring (401 Unauthorized)
        HttpStatus httpStatus = HttpStatus.UNAUTHORIZED;
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setStatus(httpStatus.value());

        // 2. Gom các thông tin phụ vào Map<String, String> details theo đúng định dạng class của bạn
        Map<String, String> details = new HashMap<>();
        details.put("error", httpStatus.getReasonPhrase()); // Trả về chữ "Unauthorized"
        details.put("path", request.getServletPath());      // Trả về API bị lỗi (Ví dụ: /api/v1/videos)

        // 3. Khởi tạo đối tượng ErrorResponse của bạn
        ErrorResponse errorResponse = new ErrorResponse(
                "Yêu cầu bị từ chối! Token không hợp lệ hoặc đã hết hạn.",
                details
        );

        // 4. Sử dụng ObjectMapper để chuyển đổi đối tượng sang JSON gửi về Client
        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), errorResponse);
    }
}
