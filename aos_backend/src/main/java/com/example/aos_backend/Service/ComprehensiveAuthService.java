package com.example.aos_backend.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.aos_backend.Repository.AdminRepository;
import com.example.aos_backend.Repository.SupportRepository;
import com.example.aos_backend.Repository.UserRepository;
import com.example.aos_backend.Service.JwtService;
import com.example.aos_backend.user.Admin;
import com.example.aos_backend.user.Support;
import com.example.aos_backend.user.User;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ComprehensiveAuthService {
    
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final SupportRepository supportRepository;
    private final PasswordEncoder passwordEncoder;

    public Map<String, Object> authenticate(String email, String password) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );
        
        var userDetails = (org.springframework.security.core.userdetails.UserDetails) authentication.getPrincipal();
        var jwtToken = jwtService.generateToken(userDetails);
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("userType", getUserType(email));
        response.put("email", email);
        
        return response;
    }

    private String getUserType(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            return "USER";
        } else if (adminRepository.findByEmail(email).isPresent()) {
            return "ADMIN";
        } else if (supportRepository.findByEmail(email).isPresent()) {
            return "SUPPORT";
        }
        return "UNKNOWN";
    }

    public String generateActivationCode(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < length; i++) {
            int randomIndex = random.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }
        return codeBuilder.toString();
    }
} 