package com.duongxyz.streaming.service.impl;

import com.duongxyz.streaming.dto.UserResponse;
import com.duongxyz.streaming.entity.Users;
import com.duongxyz.streaming.form.UserRegisterForm;
import com.duongxyz.streaming.form.UserUpdateForm;
import com.duongxyz.streaming.mapper.UserMapper;
import com.duongxyz.streaming.repository.UsersRepository;
import com.duongxyz.streaming.service.UsersService;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@AllArgsConstructor
@Service
public class UsersServiceImpl implements UsersService {
    private final UsersRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public Page<UserResponse> findAll(Pageable pageable) {
        return usersRepository.findAll(pageable)
                .map(UserMapper::map);
    }

    @Override
    public UserResponse createUser(UserRegisterForm form) {
        if(usersRepository.existsByUsername(form.getUsername())) {
            throw new IllegalArgumentException("Username is already in use");
        }

        Users user = Users.builder()
                .username(form.getUsername())
                .password(passwordEncoder.encode(form.getPassword()))
                .email(form.getEmail())
                .role(form.getRole())
                .build();

        Users savedUser = usersRepository.save(user);
        return UserMapper.map(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(UserUpdateForm form, Long id) {
        Users user = usersRepository.findById(id).orElse(null);
        if(user == null) return null;
        UserMapper.map(form, user);

        if(form.getPassword() != null && !form.getPassword().trim().isEmpty()) {
           String encodedPass = passwordEncoder.encode(form.getPassword());
           user.setPassword(encodedPass);
        }
        Users updatedUser = usersRepository.save(user);
        return UserMapper.map(updatedUser);
    }

    @Override
    @Transactional
    public boolean deleteUser(Long userId) {
        try {
            usersRepository.deleteById(userId);
            return true;
        } catch (org.springframework.dao.EmptyResultDataAccessException | jakarta.persistence.EntityNotFoundException e) {
            return false;
        }
    }

}
