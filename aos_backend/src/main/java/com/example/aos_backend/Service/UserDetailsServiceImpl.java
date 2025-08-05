package com.example.aos_backend.Service;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.aos_backend.Repository.AdminRepository;
import com.example.aos_backend.Repository.SupportRepository;
import com.example.aos_backend.Repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final SupportRepository supportRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Try to find user in regular users table
        var user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return user.get();
        }

        // Try to find user in admin table
        var admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return admin.get();
        }

        // Try to find user in support table
        var support = supportRepository.findByEmail(email);
        if (support.isPresent()) {
            return support.get();
        }

        throw new UsernameNotFoundException("User not found with email: " + email);
    }
}
