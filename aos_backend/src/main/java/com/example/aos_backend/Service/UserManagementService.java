package com.example.aos_backend.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.aos_backend.Controller.RegisterationRequest;
import com.example.aos_backend.Repository.*;
import com.example.aos_backend.dto.UserDTO;
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

        if (userRepository.findByCin(request.getCin()).isPresent()) {
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
        sendWelcomeEmail(request.getEmail(), request.getFirstName() + " " + request.getLastName(), temporaryPassword,
                request.getRole());
    }

    private Utilisateur createUser(RegisterationRequest request, Role role, String temporaryPassword) {
        Utilisateur utilisateur = Utilisateur.builder()
                .firstname(request.getFirstName())
                .lastname(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(temporaryPassword))
                .cin(request.getCin())
                .phone(request.getPhone())
                .Department(request.getDepartment())
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

    private void sendWelcomeEmail(String email, String fullName, String temporaryPassword, String role)
            throws Exception {
        emailService.sendEmail(
                email,
                fullName,
                EmailTemplateName.WELCOME_EMAIL,
                activationUrl,
                temporaryPassword,
                "Welcome to AOS MICEPP - Your Account Details",
                role);
    }

    public List<UserDTO> getAllUsers() {
        List<Utilisateur> users = userRepository.findAll();

        return users.stream().map(user -> UserDTO.builder()
                .id(user.getId())
                .firstname(user.getFirstname())
                .lastname(user.getLastname())
                .email(user.getEmail())
                .role(user.getRoles().isEmpty() ? "N/A" : user.getRoles().get(0).getName())
                .usingTemporaryPassword(user.isUsingTemporaryPassword())
                .department(user.getDepartment())
                .phone(user.getPhone())
                .cin(user.getCin())
                .matricule(user.getMatricule())
                .build())
                .toList();

    }

    @Transactional
    public UserDTO updateUser(Integer userId, UserDTO userDTO) throws Exception {
        try {
            // Vérifier que l'utilisateur existe
            Utilisateur existingUser = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

            // Vérifier l'unicité de l'email si modifié
            if (userDTO.getEmail() != null && !userDTO.getEmail().equals(existingUser.getEmail())) {
                if (userRepository.findByEmail(userDTO.getEmail()).isPresent()) {
                    throw new IllegalArgumentException("Email already exists: " + userDTO.getEmail());
                }
                existingUser.setEmail(userDTO.getEmail());
            }

            // Vérifier l'unicité du CIN si modifié
            if (userDTO.getCin() != null && !userDTO.getCin().equals(existingUser.getCin())) {
                if (userRepository.findByCin(userDTO.getCin()).isPresent()) {
                    throw new IllegalArgumentException("CIN already exists: " + userDTO.getCin());
                }
                existingUser.setCin(userDTO.getCin());
            }

            // Vérifier l'unicité du matricule si modifié
            if (userDTO.getMatricule() != null && !userDTO.getMatricule().equals(existingUser.getMatricule())) {
                if (userRepository.findByMatricule(userDTO.getMatricule()).isPresent()) {
                    throw new IllegalArgumentException("Matricule already exists: " + userDTO.getMatricule());
                }
                existingUser.setMatricule(userDTO.getMatricule());
            }

            // Mettre à jour les autres champs
            if (userDTO.getFirstname() != null) {
                existingUser.setFirstname(userDTO.getFirstname());
            }
            if (userDTO.getLastname() != null) {
                existingUser.setLastname(userDTO.getLastname());
            }
            if (userDTO.getPhone() != null) {
                existingUser.setPhone(userDTO.getPhone());
            }
            if (userDTO.getDepartment() != null) {
                existingUser.setDepartment(userDTO.getDepartment());
            }

            // Gestion de la mise à jour du rôle
            if (userDTO.getRole() != null && !userDTO.getRole().isEmpty() && !userDTO.getRole().equals("N/A")) {
                String currentRole = existingUser.getRoles().isEmpty() ? "" : existingUser.getRoles().get(0).getName();

                if (!userDTO.getRole().equalsIgnoreCase(currentRole)) {
                    updateUserRole(existingUser, userDTO.getRole());
                }
            }

            // Sauvegarder l'utilisateur mis à jour
            Utilisateur savedUser = userRepository.save(existingUser);

            // Retourner le DTO mis à jour
            return UserDTO.builder()
                    .id(savedUser.getId())
                    .firstname(savedUser.getFirstname())
                    .lastname(savedUser.getLastname())
                    .email(savedUser.getEmail())
                    .role(savedUser.getRoles().isEmpty() ? "N/A" : savedUser.getRoles().get(0).getName())
                    .usingTemporaryPassword(savedUser.isUsingTemporaryPassword())
                    .department(savedUser.getDepartment())
                    .phone(savedUser.getPhone())
                    .cin(savedUser.getCin())
                    .matricule(savedUser.getMatricule())
                    .build();
        } catch (Exception e) {
            throw new RuntimeException("Error updating user with ID: " + userId, e);
        }
    }

    @Transactional
    private void updateUserRole(Utilisateur user, String newRoleName) throws Exception {
        // Récupérer l'ancien rôle
        String oldRole = user.getRoles().isEmpty() ? "" : user.getRoles().get(0).getName();

        // Récupérer le nouveau rôle
        Role newRole = roleRepository.findByName(newRoleName.toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + newRoleName));

        // Supprimer les anciennes entités spécifiques au rôle
        cleanupOldRoleEntities(user, oldRole);

        // Mettre à jour le rôle de l'utilisateur
        user.setRoles(new ArrayList<>(List.of(newRole)));

        // Créer les nouvelles entités spécifiques au rôle
        createNewRoleEntities(user, newRoleName.toUpperCase());
    }

    private void cleanupOldRoleEntities(Utilisateur user, String oldRole) {
        switch (oldRole.toUpperCase()) {
            case "ADMIN":
                adminRepository.findByUtilisateur(user).ifPresent(adminRepository::delete);
                // Les admins sont aussi des agents, donc supprimer l'entité Agent
                agentRepository.findByUtilisateur(user).ifPresent(agentRepository::delete);
                break;
            case "SUPPORT":
                supportRepository.findByUtilisateur(user).ifPresent(supportRepository::delete);
                // Les supports sont aussi des agents, donc supprimer l'entité Agent
                agentRepository.findByUtilisateur(user).ifPresent(agentRepository::delete);
                break;
            case "AGENT":
                agentRepository.findByUtilisateur(user).ifPresent(agentRepository::delete);
                break;
        }
    }

    private void createNewRoleEntities(Utilisateur user, String newRole) {
        switch (newRole) {
            case "ADMIN":
                // Créer l'entité Admin
                Admin admin = Admin.builder()
                        .utilisateur(user)
                        .build();
                adminRepository.save(admin);

                // Créer aussi l'entité Agent (car Admin hérite d'Agent)
                Agent adminAgent = Agent.builder()
                        .utilisateur(user)
                        .build();
                agentRepository.save(adminAgent);
                break;

            case "SUPPORT":
                // Créer l'entité Support
                Support support = Support.builder()
                        .utilisateur(user)
                        .build();
                supportRepository.save(support);

                // Créer aussi l'entité Agent (car Support hérite d'Agent)
                Agent supportAgent = Agent.builder()
                        .utilisateur(user)
                        .build();
                agentRepository.save(supportAgent);
                break;

            case "AGENT":
                // Créer seulement l'entité Agent
                Agent agent = Agent.builder()
                        .utilisateur(user)
                        .build();
                agentRepository.save(agent);
                break;
        }
    }

    // Méthode pour réinitialiser le mot de passe d'un utilisateur
    @Transactional
    public void resetUserPassword(Integer userId) throws Exception {
        Utilisateur user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        // Générer un nouveau mot de passe temporaire
        String newTemporaryPassword = generateTemporaryPassword();

        // Mettre à jour le mot de passe
        user.setPassword(passwordEncoder.encode(newTemporaryPassword));
        user.setUsingTemporaryPassword(true);

        userRepository.save(user);

        // Envoyer l'email avec le nouveau mot de passe
        String roleName = user.getRoles().isEmpty() ? "USER" : user.getRoles().get(0).getName();
        sendWelcomeEmail(user.getEmail(), user.getFirstname() + " " + user.getLastname(),
                newTemporaryPassword, roleName);
    }

    // Méthode pour activer/désactiver un utilisateur
    @Transactional
    public void toggleUserStatus(Integer userId, boolean enabled) {
        Utilisateur user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with ID: " + userId));

        user.setEnabled(enabled);
        userRepository.save(user);
    }

}