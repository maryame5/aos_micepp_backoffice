package com.example.aos_backend.Service;

import java.time.LocalDateTime;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.aos_backend.Repository.AdminRepository;
import com.example.aos_backend.Repository.AgentRepository;
import com.example.aos_backend.Repository.SupportRepository;
import com.example.aos_backend.Repository.*;
import com.example.aos_backend.user.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PasswordChangeService {

    private final UtilisateurRepository userRepository;
    private final AdminRepository adminRepository;
    private final SupportRepository supportRepository;
    private final PasswordEncoder passwordEncoder;


    @Transactional
    public boolean changePassword(String email, String currentPassword, String newPassword) {
        Utilisateur user = userRepository.findByEmail(email)
           .orElseThrow(() -> new IllegalArgumentException("User not found with email: " + email));

        if (passwordEncoder.matches(currentPassword, user.getPassword())) {
            user.setPassword(passwordEncoder.encode(newPassword));
            user.setUsingTemporaryPassword(false);
            user.setLastModifiedDate(LocalDateTime.now());
           userRepository.save(user);
           return true;
        }
        return false;
    }
}