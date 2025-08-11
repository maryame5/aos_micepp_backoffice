package com.example.aos_backend.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.aos_backend.Controller.RegisterationRequest;
import com.example.aos_backend.Repository.*;
import com.example.aos_backend.user.Admin;
import com.example.aos_backend.user.Agent;
import com.example.aos_backend.user.Role;
import com.example.aos_backend.user.Support;
import com.example.aos_backend.user.Utilisateur;
import lombok.RequiredArgsConstructor;
@Service
@RequiredArgsConstructor
public class UserManagementService {
    private final UtilisateurRepository userRepository;
    private final AdminRepository adminRepository;
    private final AgentRepository agentRepository;
    private final SupportRepository supportRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Value("${application.mailing.frontend.activation-url}")
    private String activationUrl;

    @Transactional
    public void registerUser(RegisterationRequest request) throws Exception {
        // Check for existing user
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        if (userRepository.findByCin(request.getCin()).isPresent() ) {
            throw new IllegalArgumentException("CIN already exists: " + request.getCin());
        }

        if (userRepository.findByMatricule(request.getMatricule()).isPresent()) {
            throw new IllegalArgumentException("Matricule already exists: " + request.getMatricule());
        }

        // Get the role
        Role userRole = roleRepository.findByName(request.getRole().toUpperCase())
            .orElseThrow(() -> new IllegalArgumentException("Role not found: " + request.getRole()));

        // Generate temporary password
        String temporaryPassword = generateTemporaryPassword();

        // Create user based on role
        switch (request.getRole().toUpperCase()) {
            case "AGENT":
                createAgentUser(request, userRole, temporaryPassword);
                break;
            case "ADMIN":
                createAdminUser(request, userRole, temporaryPassword);
                break;
            case "SUPPORT":
                createSupportUser(request, userRole, temporaryPassword);
                
               
                break;
            default:
                throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }

        // Send welcome email with temporary password
        sendWelcomeEmail(request.getEmail(), request.getFirstname() + " " + request.getLastname(), temporaryPassword, request.getRole());
    }

    private Utilisateur createUser(RegisterationRequest request, Role role, String temporaryPassword) {
        Utilisateur utilisateur = Utilisateur.builder()
        .firstname(request.getFirstname())
        .lastname(request.getLastname())
        .email(request.getEmail())
        .password(passwordEncoder.encode(temporaryPassword))
        .cin(request.getCin())
        .phone(request.getPhone())
        .matricule(request.getMatricule())
        .accountLocked(false)
        .enabled(true)
        .usingTemporaryPassword(true)
        .roles(List.of(role))
        .build();
        userRepository.save(utilisateur);
        return utilisateur;
    }

    private void createAgentUser(RegisterationRequest request, Role role, String temporaryPassword) {

        Utilisateur utilisateur = createUser(request, role, temporaryPassword);
        Agent agent = Agent.builder()
            .utilisateur(utilisateur)
            .build();
        agentRepository.save(agent);
    }


    private void createAdminUser(RegisterationRequest request, Role role, String temporaryPassword) {
        Utilisateur utilisateur = createUser(request, role, temporaryPassword);

        Admin admin = Admin.builder()
            .utilisateur(utilisateur)
            .build();
        adminRepository.save(admin);

        Agent agent = Agent.builder()
            .utilisateur(utilisateur)
            .build();
        agentRepository.save(agent);
    }
       
    

    private void createSupportUser(RegisterationRequest request, Role role, String temporaryPassword) {
        // 1) Crée un utilisateur "générique"
     Utilisateur utilisateur = createUser(request, role, temporaryPassword);

      
       Support support = Support.builder()
            .utilisateur(utilisateur)
            .build();
        supportRepository.save(support);

        Agent agent = Agent.builder()
            .utilisateur(utilisateur)
            .build();
        agentRepository.save(agent);
    }
   

    private String generateTemporaryPassword() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%";
        StringBuilder passwordBuilder = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int i = 0; i < 12; i++) {
            int randomIndex = random.nextInt(characters.length());
            passwordBuilder.append(characters.charAt(randomIndex));
        }
        return passwordBuilder.toString();
    }

    private void sendWelcomeEmail(String email, String fullName, String temporaryPassword, String role) throws Exception {
        emailService.sendEmail(
            email,
            fullName,
            EmailTemplateName.WELCOME_EMAIL,
            activationUrl,
            temporaryPassword,
            "Welcome to AOS MICEPP - Your Account Details"
        );
    }
}