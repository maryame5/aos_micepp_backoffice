package com.example.aos_backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.aos_backend.Repository.DemandeRepository;
import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.StatutDemande;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/requests")
@RequiredArgsConstructor
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_SUPPORT', 'ROLE_AGENT')")
public class RequestController {

    private final DemandeRepository demandeRepository;

    @GetMapping
    public ResponseEntity<List<Demande>> getAllRequests() {
        try {
            List<Demande> requests = demandeRepository.findAll();
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<Demande> getRequestById(@PathVariable Long id) {
        try {
            return demandeRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Demande>> getUserRequests(@PathVariable Integer userId) {
        try {
            List<Demande> requests = demandeRepository.findByUtilisateurId(userId);
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getRequestsCount() {
        try {
            long count = demandeRepository.count();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/count/pending")
    public ResponseEntity<Long> getPendingRequestsCount() {
        try {
            long count = demandeRepository.countByStatus("EN_ATTENTE");
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/recent")
    public ResponseEntity<List<Demande>> getRecentRequests(
            @RequestParam(defaultValue = "5") int limit) {
        try {
            List<Demande> requests = demandeRepository.findRecentDemandes();
            if (requests.size() > limit) {
                requests = requests.subList(0, limit);
            }
            return ResponseEntity.ok(requests);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PostMapping
    public ResponseEntity<Demande> createRequest(@RequestBody Demande request) {
        try {
            Demande savedRequest = demandeRepository.save(request);
            return ResponseEntity.ok(savedRequest);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Demande> updateRequestStatus(
            @PathVariable Long id, 
            @RequestBody Map<String, String> statusUpdate) {
        try {
            return demandeRepository.findById(id)
                .map(request -> {
                    request.setStatut(StatutDemande.valueOf(statusUpdate.get("status")));
                    return ResponseEntity.ok(demandeRepository.save(request));
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<Demande> assignRequest(
            @PathVariable Long id, 
            @RequestBody Map<String, Integer> assignment) {
        try {
            return demandeRepository.findById(id)
                .map(request -> {
                    // This would need to be implemented based on your assignment logic
                    return ResponseEntity.ok(request);
                })
                .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
