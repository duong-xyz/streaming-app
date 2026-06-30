package com.duongxyz.streaming.controller;

import com.duongxyz.streaming.dto.JwtResponse;
import com.duongxyz.streaming.dto.UserResponse;
import com.duongxyz.streaming.form.LoginRequest;
import com.duongxyz.streaming.form.UserRegisterForm;
import com.duongxyz.streaming.form.UserUpdateForm;
import com.duongxyz.streaming.mapper.UserMapper;
import com.duongxyz.streaming.security.CustomUserDetails;
import com.duongxyz.streaming.security.jwt.JwtUtils;
import com.duongxyz.streaming.service.UsersService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class UserController {
    private final UsersService usersService;
    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;

    // API Đăng nhập sinh token JWT
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        Authentication authentication =
                authenticationManager.authenticate(
                        new UsernamePasswordAuthenticationToken(loginRequest.getUsername(),loginRequest.getPassword())
                );
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication.getName());
        // Tìm thông tin user hiển thị kèm ra client
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        UserResponse userResponse = UserMapper.map(userDetails.getUser());

        return ResponseEntity.ok(new JwtResponse(jwt, userResponse));
    }

    // Lấy danh sách toàn bộ người dùng phân trang
    // Chỉ ADMIN mới có quyền xem danh sách toàn bộ người dùng phân trang
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')") // Phân quyền trực tiếp
    public ResponseEntity<Page<UserResponse>> getAllUsers(Pageable pageable) {
        Page<UserResponse> users = usersService.findAll(pageable);
        return ResponseEntity.ok(users);
    }

    // Đăng ký/Tạo mới người dùng
    @PostMapping("/register")
    public ResponseEntity<UserResponse> registerUser(@Valid @RequestBody UserRegisterForm form) {
        UserResponse createdUser = usersService.createUser(form);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
    }

    // Cập nhật thông tin người dùng theo ID
    // Cho phép chính USER đó sửa hoặc ADMIN sửa đổi
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or authentication.principal.user.id == #id")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateForm form) {
        UserResponse updatedUser = usersService.updateUser(form, id);

        // Xử lý trường hợp không tìm thấy người dùng (Service đang trả về null)
        if (updatedUser == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updatedUser);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        boolean isDeleted = usersService.deleteUser(id);

        if (!isDeleted) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.noContent().build(); // Trả về 204 No Content khi xóa thành công
    }
}
