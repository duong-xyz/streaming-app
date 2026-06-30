package com.duongxyz.streaming.service;

import com.duongxyz.streaming.dto.UserResponse;
import com.duongxyz.streaming.form.UserRegisterForm;
import com.duongxyz.streaming.form.UserUpdateForm;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UsersService {
    Page<UserResponse> findAll(Pageable pageable);

    UserResponse createUser(UserRegisterForm form);

    UserResponse updateUser(UserUpdateForm form, Long id);

    boolean deleteUser(Long userId);
}
