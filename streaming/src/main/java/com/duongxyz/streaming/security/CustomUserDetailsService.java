package com.duongxyz.streaming.security;

import com.duongxyz.streaming.entity.Users;
import com.duongxyz.streaming.repository.UsersRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {
    private final UsersRepository usersRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Users user = usersRepository.findByUsername(username)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Không tìm thấy user: "+username));
        return new CustomUserDetails(user);
    }
}

/*
* lớp dịch vụ tìm kiếm User từ database phục vụ cho quá trình xác thực
* */
