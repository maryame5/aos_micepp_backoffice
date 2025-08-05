package com.example.aos_backend.Service;

import java.security.SecureRandom;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.aos_backend.Controller.RegisterationRequest;
import com.example.aos_backend.Repository.AdminRepository;
import com.example.aos_backend.Repository.RoleRepository;
import com.example.aos_backend.Repository.SupportRepository;
import com.example.aos_backend.Repository.UserRepository;
import com.example.aos_backend.user.Admin;
import com.example.aos_backend.user.Role;
import com.example.aos_backend.user.Support;
import com.example.aos_backend.user.User;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserManagementService {
    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final SupportRepository supportRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    
    @Value("${application.mailing.frontend.activation-url}")
    private String activationUrl;

    @Transactional
    public void registerUser(RegisterationRequest request) throws MessagingException {
        // Check if user exists in any table
        if (userRepository.findByEmail(request.getEmail()).isPresent() ||
            adminRepository.findByEmail(request.getEmail()).isPresent() ||
            supportRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        if (userRepository.findByCIN(request.getCIN()).isPresent() ||
            adminRepository.findByCIN(request.getCIN()).isPresent() ||
            supportRepository.findByCIN(request.getCIN()).isPresent()) {
            throw new IllegalArgumentException("CIN already exists: " + request.getCIN());
        }

        if (userRepository.findByMatricule(request.getMatricule()).isPresent() ||
            adminRepository.findByMatricule(request.getMatricule()).isPresent() ||
            supportRepository.findByMatricule(request.getMatricule()).isPresent()) {
            throw new IllegalArgumentException("Matricule already exists: " + request.getMatricule());
        }

        // Get the role
        Role userRole = roleRepository.findByName(request.getRole())
            .orElseThrow(() -> new RuntimeException("Role not found: " + request.getRole()));

        // Generate temporary password
        String temporaryPassword = generateTemporaryPassword();
        
        // Create user based on role
        switch (request.getRole().toUpperCase()) {
            case "USER":
                createRegularUser(request, userRole, temporaryPassword);
                break;
            case "ADMIN":
                createAdminUser(request, userRole, temporaryPassword);
                createRegularUser(request, userRole, temporaryPassword);

                break;
            case "SUPPORT":
                createSupportUser(request, userRole, temporaryPassword);
                createRegularUser(request, userRole, temporaryPassword);
                break;
            default:
                throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }
        
        // Send welcome email with temporary password
        sendWelcomeEmail(request.getEmail(), request.getFirstname() + " " + request.getLastname(), temporaryPassword, request.getRole());
    }

    private void createRegularUser(RegisterationRequest request, Role role, String temporaryPassword) {
        User user = User.builder()
            .firstname(request.getFirstname())
            .lastname(request.getLastname())
            .email(request.getEmail())
            .password(passwordEncoder.encode(temporaryPassword))
            .CIN(request.getCIN())
            .phone(request.getPhone())
            .matricule(request.getMatricule())
            .accountLocked(false)
            .enabled(true)
            .roles(List.of(role))
            .build();
        userRepository.save(user);
    }

    private void createAdminUser(RegisterationRequest request, Role role, String temporaryPassword) {
        Admin admin = Admin.builder()
            .firstname(request.getFirstname())
            .lastname(request.getLastname())
            .email(request.getEmail())
            .password(passwordEncoder.encode(temporaryPassword))
            .CIN(request.getCIN())
            .phone(request.getPhone())
            .matricule(request.getMatricule())
            .accountLocked(false)
            .enabled(true)
            .roles(List.of(role))
            .build();
        adminRepository.save(admin);
    }

    private void createSupportUser(RegisterationRequest request, Role role, String temporaryPassword) {
        Support support = Support.builder()
            .firstname(request.getFirstname())
            .lastname(request.getLastname())
            .email(request.getEmail())
            .password(passwordEncoder.encode(temporaryPassword))
            .CIN(request.getCIN())
            .phone(request.getPhone())
            .matricule(request.getMatricule())
            .accountLocked(false)
            .enabled(true)
            .roles(List.of(role))
            .build();
        supportRepository.save(support);
    }
    
    private String generateTemporaryPassword() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        StringBuilder passwordBuilder = new StringBuilder();
        SecureRandom random = new SecureRandom();
        
        // Generate 12-character password
        for (int i = 0; i < 12; i++) {
            int randomIndex = random.nextInt(characters.length());
            passwordBuilder.append(characters.charAt(randomIndex));
        }
        return passwordBuilder.toString();
    }
    
    private void sendWelcomeEmail(String email, String fullName, String temporaryPassword, String role) throws MessagingException {
        String subject = "Welcome to AOS MICEPP - Your Account Details";
        String message = String.format(
            "Dear %s,\n\n" +
            "Welcome to AOS MICEPP! Your account has been created successfully.\n\n" +
            "Account Details:\n" +
            "- Email: %s\n" +
            "- Role: %s\n" +
            "- Temporary Password: %s\n\n" +
            "Please login with your email and the temporary password above.\n" +
            "You will be prompted to change your password on your first login.\n\n" +
            "Best regards,\n" +
            "AOS MICEPP Team",
            fullName, email, role, temporaryPassword
        );
        
        emailService.sendEmail(
            email,
            fullName,
            EmailTemplateName.WELCOME_EMAIL,
            temporaryPassword, // Using confirmationUrl field for password
            role, // Using activationCode field for role
            subject
        );
    }
} 