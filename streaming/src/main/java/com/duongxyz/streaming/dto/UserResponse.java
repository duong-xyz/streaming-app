package com.duongxyz.streaming.dto;

import com.duongxyz.streaming.constant.UserRole;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String username;
    private String email;
    private UserRole role; // Khi Jackson serialize, nó sẽ tự chuyển Enum thành chữ (STRING) trả về client rất đẹp
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
