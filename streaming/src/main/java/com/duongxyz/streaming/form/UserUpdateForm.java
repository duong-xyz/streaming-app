package com.duongxyz.streaming.form;

import com.duongxyz.streaming.constant.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
public class UserUpdateForm {
    @Size(min = 4, max = 150, message = "Tài khoản phải từ 4 đến 150 ký tự")
    private String username;

    @Size(min = 6, max = 255, message = "Mật khẩu phải từ 6 ký tự trở lên")
    private String password;

    @Email(message = "Email không đúng định dạng")
    @Size(max = 150, message = "Email không được vượt quá 150 ký tự")
    private String email;

    private UserRole role;
}
