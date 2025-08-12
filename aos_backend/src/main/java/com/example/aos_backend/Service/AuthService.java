package com.example.aos_backend.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import com.example.aos_backend.Repository.AdminRepository;
import com.example.aos_backend.Repository.SupportRepository;
import com.example.aos_backend.Repository.TokenRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.Service.*;
import com.example.aos_backend.user.Token;
import com.example.aos_backend.user.Utilisateur;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final TokenRepository tokenRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UtilisateurRepository userRepository;
    private final AdminRepository adminRepository;
    private final SupportRepository supportRepository;

    public Map<String, Object> authenticate(String email, String password) {
        // Authenticate user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(email, password)
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Generate JWT token
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String jwtToken = jwtService.generateToken(userDetails);

        // Save token
        Utilisateur user = getUserByEmail(email);
        Token token = Token.builder()
            .token(jwtToken)
            .createdAt(LocalDateTime.now())
            .expiresAt(LocalDateTime.now().plusHours(24))
            .utilisateur(user)
            .build();
        tokenRepository.save(token);

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("token", jwtToken);
        response.put("userT", getUserType(email));
        response.put("userType", user.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .findFirst()
            .orElse("UNKNOWN"));
        response.put("email", email);
        response.put("mustChangePassword", isUsingTemporaryPassword(email));
        response.put("userId", user.getId());
        response.put("FirstName", user.getLastname());
        response.put("LastName", user.getFirstname());

        return response;
    }

    public Utilisateur getUserByEmail(String email) {
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    private boolean isUsingTemporaryPassword(String email) {
        return getUserByEmail(email).isUsingTemporaryPassword();
    }

    private String getUserType(String email) {
        Utilisateur user = getUserByEmail(email);
        if (adminRepository.existsByUtilisateur(user)) {
            return "ADMIN";
        }
        if (supportRepository.existsByUtilisateur(user)) {
            return "SUPPORT";
        }
        return "AGENT";
    }
}