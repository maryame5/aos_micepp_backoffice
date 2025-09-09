package com.example.aos_backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;

import com.example.aos_backend.Service.ReclamationService;
import com.example.aos_backend.dto.UpdateRequest;

import java.util.*;
import com.example.aos_backend.user.Reclamation;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/Reclamation")
@RequiredArgsConstructor
public class ReclamationController {

    private final ReclamationService reclamationService;

    @GetMapping("All")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Reclamation>> getAllReclamations() {
        try {
            List<Reclamation> reclamations = reclamationService.getAllReclamations();
            return ResponseEntity.ok(reclamations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }

    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPPORT')")
    public ResponseEntity<Reclamation> getReclamationById(@PathVariable Long id) {
        try {
            Reclamation reclamation = reclamationService.getReclamationById(id);
            return ResponseEntity.ok(reclamation);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/{id}/assign/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') ")
    public ResponseEntity<Reclamation> assignReclamation(@PathVariable Long id, @PathVariable String userId) {
        try {
            Integer userIdInt = null;
            if (!"null".equals(userId)) {
                try {
                    userIdInt = Integer.parseInt(userId);
                } catch (NumberFormatException e) {
                    return ResponseEntity.badRequest().build();
                }
            }

            Reclamation updatedReclamation = reclamationService.assignReclamation(id, userIdInt);
            return ResponseEntity.ok(updatedReclamation);
        } catch (RuntimeException e) {
            System.err.println("Error in assignReclamation: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    // Endpoint pour désaffecter une réclamation
    @PatchMapping("/{id}/assign/null")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Reclamation> unassignReclamation(@PathVariable Long id) {
        try {
            Reclamation updatedReclamation = reclamationService.assignReclamation(id, null);
            return ResponseEntity.ok(updatedReclamation);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/assigned/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPPORT')")
    public ResponseEntity<List<Reclamation>> getReclamationsByAssignedUser(@PathVariable Integer userId) {
        try {
            List<Reclamation> reclamations = reclamationService.getReclamationsByAssignedUser(userId);
            return ResponseEntity.ok(reclamations);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }

    }

    @PatchMapping("/{id}/update")
    @PreAuthorize("hasAuthority('ROLE_ADMIN') or hasAuthority('ROLE_SUPPORT')")
    public ResponseEntity<Reclamation> updateReclamation(@PathVariable Long id, @RequestBody UpdateRequest request) {
        try {
            Reclamation updatedReclamation = reclamationService.updateReclamationStatus(id, request);
            return ResponseEntity.ok(updatedReclamation);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

}
