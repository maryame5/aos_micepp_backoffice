package com.example.aos_backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.Service.UserManagementService;
import com.example.aos_backend.dto.UserDTO;
import com.example.aos_backend.user.Utilisateur;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class UserController {

    private final UtilisateurRepository utilisateurRepository;
    private final UserManagementService userService;

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

                            .email(user.getEmail())
                            .role(user.getRoles().isEmpty() ? "N/A" : user.getRoles().get(0).getName())
                            .usingTemporaryPassword(user.isUsingTemporaryPassword())
                            .phone(user.getPhone())
                            .cin(user.getCin())
                            .matricule(user.getMatricule())
                            .build())
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserDTO> updateUser(@PathVariable Integer id, @RequestBody UserDTO userDTO) {
        try {
            return utilisateurRepository.findById(id)
                    .map(existingUser -> {
                        // Mettre à jour les champs modifiables
                        if (userDTO.getPhone() != null) {
                            existingUser.setPhone(userDTO.getPhone());
                        }
                        if (userDTO.getEmail() != null) {
                            existingUser.setEmail(userDTO.getEmail());
                        }
                        // Ajouter d'autres champs selon vos besoins

                        Utilisateur savedUser = utilisateurRepository.save(existingUser);

                        UserDTO updatedDTO = UserDTO.builder()
                                .id(savedUser.getId())
                                .firstname(savedUser.getFirstname())
                                .lastname(savedUser.getLastname())
                                .email(savedUser.getEmail())
                                .role(savedUser.getRoles().isEmpty() ? "N/A" : savedUser.getRoles().get(0).getName())
                                .usingTemporaryPassword(savedUser.isUsingTemporaryPassword())
                                .phone(savedUser.getPhone())
                                .cin(savedUser.getCin())
                                .matricule(savedUser.getMatricule())
                                .build();

                        return ResponseEntity.ok(updatedDTO);
                    })
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
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
}
