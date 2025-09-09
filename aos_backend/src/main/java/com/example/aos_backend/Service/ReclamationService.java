package com.example.aos_backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.aos_backend.Repository.ReclamationRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.dto.UpdateRequest;
import com.example.aos_backend.user.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReclamationService {

    private final ReclamationRepository reclamationRepository;
    private final UtilisateurRepository userRepository;

    public List<Reclamation> getAllReclamations() {
        List<Reclamation> reclamations = reclamationRepository.findAll();
        if (reclamations.isEmpty()) {
            log.info("No reclamations found.");
        } else {
            log.info("Retrieved {} reclamations.", reclamations.size());
        }

        return reclamations;
    }

    public Reclamation getReclamationById(Long id) {
        return reclamationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + id));
    }

    public Reclamation assignReclamation(Long reclamationId, Integer userId) {
        Reclamation reclamation = reclamationRepository.findById(reclamationId)
                .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + reclamationId));

        Utilisateur user = null;
        if (userId != null) {
            user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé pour l'ID: " + userId));
            // Validate that the user has SUPPORT role
            boolean isSupport = user.getRoles().stream()
                    .anyMatch(role -> role.getName().equals("SUPPORT"));

            boolean isAdmin = user.getRoles().stream()
                    .anyMatch(role -> role.getName().equals("ADMIN"));
            if (!isSupport && !isAdmin) {
                throw new IllegalArgumentException("L'utilisateur doit avoir le rôle SUPPORT pour être assigné");
            }
        }

        reclamation.setAssignedTo(user);
        reclamation.setLastModifiedDate(new java.sql.Timestamp(System.currentTimeMillis()).toLocalDateTime());

        if (userId == null) {
            reclamation.setStatut(StatutReclamation.EN_ATTENTE);
        } else {
            reclamation.setStatut(StatutReclamation.AFFECTEE);
        }
        reclamation = reclamationRepository.save(reclamation);

        return reclamation;
    }

    public List<Reclamation> getReclamationsByAssignedUser(Integer userId) {

        Utilisateur user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé pour l'ID: " + userId));
        return reclamationRepository.findByAssignedTo(user);
    }

    public Reclamation updateReclamationStatus(Long complaintId, UpdateRequest request) {
        Reclamation reclamation = reclamationRepository.findById(complaintId)
                .orElseThrow(() -> new RuntimeException("Reclamation not found with id: " + complaintId));

        if (request.getStatut() != null) {
            try {
                StatutReclamation newStatus = StatutReclamation.valueOf(request.getStatut());
                reclamation.setStatut(newStatus);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status value: " + request.getStatut());
            }
        }

        if (request.getCommentaire() != null) {
            reclamation.setCommentaire(request.getCommentaire());
        }

        reclamation.setLastModifiedDate(java.time.LocalDateTime.now());
        reclamation = reclamationRepository.save(reclamation);
        return reclamation;
    }

}
