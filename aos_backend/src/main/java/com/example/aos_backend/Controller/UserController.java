package com.example.aos_backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.example.aos_backend.Repository.AdminRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.Repository.SupportRepository;
import com.example.aos_backend.Repository.AgentRepository;
import com.example.aos_backend.Repository.ReclamationRepository;
import com.example.aos_backend.Repository.StorageRepository;
import com.example.aos_backend.Repository.DocumentPublicRepository;
import com.example.aos_backend.Repository.DemandeRepository;
import com.example.aos_backend.Service.UserManagementService;
import com.example.aos_backend.dto.UserDTO;
import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.DocumentJustificatif;
import com.example.aos_backend.user.Utilisateur;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    private final UtilisateurRepository utilisateurRepository;
    private final UserManagementService userService;
    private final AdminRepository adminRepository;
    private final SupportRepository supportRepository;
    private final AgentRepository agentRepository;
    private final ReclamationRepository reclamationRepository;
    private final DocumentPublicRepository documentPublicRepository;
    private final DemandeRepository demandeRepository;
    private final StorageRepository documentJustificatifRepository;

    @GetMapping
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        try {
            List<UserDTO> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Integer id) {
        try {
            return utilisateurRepository.findById(id)
                    .map(user -> UserDTO.builder()
                            .id(user.getId())
                            .firstname(user.getFirstname())
                            .lastname(user.getLastname())
                            .enabled(user.isEnabled())
                            .email(user.getEmail())
                            .role(user.getRoles().isEmpty() ? "N/A" : user.getRoles().get(0).getName())
                            .usingTemporaryPassword(user.isUsingTemporaryPassword())
                            .phone(user.getPhone())
                            .department(user.getDepartment())
                            .cin(user.getCin())
                            .matricule(user.getMatricule())
                            .build())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            logger.error("Error getting user with id {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Integer id, @RequestBody UserDTO userDTO) {
        try {
            logger.info("Updating user with id {}", id);
            UserDTO updatedUser = userService.updateUser(id, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (IllegalArgumentException e) {
            logger.warn("Invalid argument for updating user with id {}", id, e);
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            logger.error("Error updating user with id {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getUsersCount() {
        try {
            long count = utilisateurRepository.count();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/role/{role}")
    public ResponseEntity<List<Utilisateur>> getUsersByRole(@PathVariable String role) {
        try {
            // This would need to be implemented based on your role structure
            // For now, returning all users
            List<Utilisateur> users = utilisateurRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Utilisateur>> getRecentUsers() {
        try {
            // Get users created in the last 30 days
            LocalDateTime thirtyDaysAgo = LocalDateTime.now().minusDays(30);
            List<Utilisateur> recentUsers = utilisateurRepository.findAll().stream()
                    .filter(user -> user.getCreatedDate() != null &&
                            user.getCreatedDate().isAfter(thirtyDaysAgo))
                    .toList();
            return ResponseEntity.ok(recentUsers);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @DeleteMapping("/{id}")
    @Transactional
    public ResponseEntity<Void> deleteUser(@PathVariable Integer id) {
        try {
            logger.info("Deleting user with id {}", id);
            if (!utilisateurRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            Utilisateur user = utilisateurRepository.findById(id).get();

            // Check and delete related documents
            List<com.example.aos_backend.user.DocumentPublic> userDocuments = documentPublicRepository
                    .findByPublishedByIdOrderByCreatedDateDesc(id);
            if (!userDocuments.isEmpty()) {
                logger.info("Deleting {} documents published by user {}", userDocuments.size(), id);
                documentPublicRepository.deleteAll(userDocuments);
            }

            // Check and delete related demands (as owner)
            List<Demande> userDemandes = demandeRepository.findByUtilisateur(user);
            if (!userDemandes.isEmpty()) {
                logger.info("Deleting {} demands owned by user {}", userDemandes.size(), id);

                // Collect all justificative documents from user's demands
                List<DocumentJustificatif> justificativeDocuments = userDemandes.stream()
                        .flatMap(demande -> demande.getDocumentsJustificatifs().stream())
                        .collect(Collectors.toList());

                // Collect all response documents from user's demands
                List<DocumentJustificatif> responseDocuments = userDemandes.stream()
                        .map(demande -> demande.getDocumentReponse())
                        .filter(document -> document != null)
                        .collect(Collectors.toList());

                if (!justificativeDocuments.isEmpty()) {
                    logger.info("Deleting {} justificative documents related to user's demands",
                            justificativeDocuments.size());
                    documentJustificatifRepository.deleteAll(justificativeDocuments);
                }

                if (!responseDocuments.isEmpty()) {
                    logger.info("Deleting {} response documents related to user's demands",
                            responseDocuments.size());
                    documentJustificatifRepository.deleteAll(responseDocuments);

                    demandeRepository.deleteAll(userDemandes);
                }
            }
            // Check and delete related demands (as assigned user)
            List<Demande> assignedDemandes = demandeRepository.findByAssignedTo(user);
            if (!assignedDemandes.isEmpty()) {
                logger.info("Unassigning {} demands assigned to user {}", assignedDemandes.size(), id);
                // Set assignedTo to null for these demands instead of deleting them
                assignedDemandes.forEach(demande -> demande.setAssignedTo(null));
                demandeRepository.saveAll(assignedDemandes);
            }

            // Check if user has related reclamations BEFORE attempting deletion
            if (reclamationRepository.existsByUtilisateur(user)) {
                logger.warn("Cannot delete user with id {} because of existing reclamations", id);
                return ResponseEntity.status(409).build(); // Conflict status
            }

            // Delete user from role-specific tables
            if (adminRepository.findByUtilisateur(user).isPresent()) {
                adminRepository.deleteByUtilisateur(user);
            }
            if (supportRepository.findByUtilisateur(user).isPresent()) {
                supportRepository.deleteByUtilisateur(user);
            }
            if (agentRepository.findByUtilisateur(user).isPresent()) {
                agentRepository.deleteByUtilisateur(user);
            }

            utilisateurRepository.deleteById(id);
            return ResponseEntity.noContent().build();

        } catch (Exception e) {
            logger.error("Error deleting user with id {}", id, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/reset-password")
    public ResponseEntity<Void> resetUserPassword(@PathVariable Integer id) {
        try {
            userService.resetUserPassword(id);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<Void> toggleUserStatus(@PathVariable Integer id, @RequestParam boolean enabled) {
        try {
            userService.toggleUserStatus(id, enabled);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
