package com.duongxyz.streaming.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Áp dụng cấu hình thông quan cho TẤT CẢ API
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH") // Cho phép mọi phương thức
                .allowedHeaders("*") // Nhận toàn bộ loại Header từ Frontend
                .allowCredentials(true) // Cho phép truyền cookie / token xác thực an toàn
                .maxAge(3600); // Lưu cache cấu hình 1 tiếng để tăng tốc độ load mạng
    }
}
