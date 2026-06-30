package com.duongxyz.streaming.mapper;

import com.duongxyz.streaming.dto.UserResponse;
import com.duongxyz.streaming.entity.Users;
import com.duongxyz.streaming.form.UserRegisterForm;
import com.duongxyz.streaming.form.UserUpdateForm;

public class UserMapper {
    // --- 1. Map từ Entity sang UserResponse ---
    public static UserResponse map(Users user) {
        if (user == null) return null;

        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    // --- 2. Map từ UserRegisterForm sang Entity mới ---
    public static Users map(UserRegisterForm form) {
        if (form == null) return null;

        return Users.builder()
                .username(form.getUsername())
                .email(form.getEmail())
                // Gán role từ form, nếu form gửi null thì Service sẽ chủ động gán mặc định sau
                .role(form.getRole())
                // Lưu ý: Trường password không gán trực tiếp ở đây để ép tầng Service phải mã hóa BCrypt
                .build();
    }

    // --- 3. Cập nhật Entity hiện có từ UserUpdateForm ---
    public static void map(UserUpdateForm form, Users user) {
        if (form == null || user == null) return;

        // Chỉ cập nhật các trường có giá trị truyền lên từ client
        if (form.getUsername() != null && !form.getUsername().isBlank()) {
            user.setUsername(form.getUsername());
        }
        if (form.getEmail() != null && !form.getEmail().isBlank()) {
            user.setEmail(form.getEmail());
        }
        if (form.getRole() != null) {
            user.setRole(form.getRole());
        }
        // Lưu ý: Không xử lý trường form.getPassword() tại đây. Mật khẩu mới cần được
        // mã hóa riêng bằng PasswordEncoder ở tầng Service trước khi set vào entity.
    }
}
