package com.example.aos_backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.aos_backend.Repository.UtilisateurRepository;
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

    @GetMapping
    public ResponseEntity<List<Utilisateur>> getAllUsers() {
        try {
            List<Utilisateur> users = utilisateurRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Utilisateur> getUserById(@PathVariable Integer id) {
        try {
            return utilisateurRepository.findById(id)
                .map(ResponseEntity::ok)
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
