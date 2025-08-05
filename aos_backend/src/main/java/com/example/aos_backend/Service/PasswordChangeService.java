package com.example.aos_backend.Service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.aos_backend.Repository.AdminRepository;
import com.example.aos_backend.Repository.SupportRepository;
import com.example.aos_backend.Repository.UserRepository;
import com.example.aos_backend.user.Admin;
import com.example.aos_backend.user.Support;
import com.example.aos_backend.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordChangeService {
    
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final SupportRepository supportRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Transactional
    public boolean changePassword(String email, String currentPassword, String newPassword) {
        // Try to find user in regular users table
        var user = userRepository.findByEmail(email);
        if (user.isPresent()) {
            return changeUserPassword(user.get(), currentPassword, newPassword);
        }
        
        // Try to find user in admin table
        var admin = adminRepository.findByEmail(email);
        if (admin.isPresent()) {
            return changeAdminPassword(admin.get(), currentPassword, newPassword);
        }
        
        // Try to find user in support table
        var support = supportRepository.findByEmail(email);
        if (support.isPresent()) {
            return changeSupportPassword(support.get(), currentPassword, newPassword);
        }
        
        return false;
    }
    
    private boolean changeUserPassword(User user, String currentPassword, String newPassword) {
        if (passwordEncoder.matches(currentPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            userRepository.save(user);
            return true;
        }
        return false;
    }
    
    private boolean changeAdminPassword(Admin admin, String currentPassword, String newPassword) {
        if (passwordEncoder.matches(currentPassword, admin.getPassword())) {
            admin.setPassword(passwordEncoder.encode(newPassword));
            adminRepository.save(admin);
            return true;
        }
        return false;
    }
    
    private boolean changeSupportPassword(Support support, String currentPassword, String newPassword) {
        if (passwordEncoder.matches(currentPassword, support.getPassword())) {
            support.setPassword(passwordEncoder.encode(newPassword));
            supportRepository.save(support);
            return true;
        }
        return false;
    }
} 