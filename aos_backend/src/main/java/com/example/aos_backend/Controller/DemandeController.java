package com.example.aos_backend.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.aos_backend.Service.DemandeService;
import com.example.aos_backend.Util.DocumentUtil;
import com.example.aos_backend.dto.DemandeDTO;
import com.example.aos_backend.dto.UpdateDemandeRequest;
import com.example.aos_backend.dto.UserDTO;
import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.DocumentJustificatif;
import com.example.aos_backend.user.Utilisateur;

import io.swagger.v3.oas.annotations.parameters.RequestBody;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/demandes")
@RequiredArgsConstructor
@Slf4j
public class DemandeController {
    // Inject the DemandeService
    private final DemandeService demandeService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DemandeDTO>> getAllDemandes() {
        try {
            return ResponseEntity.ok(demandeService.getAllDemandes());
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }

    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DemandeDTO> getDemandeById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(demandeService.getDemandeById(id));
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @GetMapping("/{id}/service-data")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> getDemandeServiceData(@PathVariable Long id) {
        try {
            Map<String, Object> serviceData = demandeService.getDemandeServiceData(id);
            return ResponseEntity.ok(serviceData);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/{demandeId}/documents/{documentId}")
    @PreAuthorize("isAuthenticated()")
    @Transactional
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long demandeId, @PathVariable Long documentId) {
        Demande demande = demandeService.getDemandById(demandeId);

        // First check in regular documents
        Optional<DocumentJustificatif> documentOpt = demande.getDocumentsJustificatifs().stream()
                .filter(doc -> doc.getId().equals(documentId))
                .findFirst();

        // If not found in regular documents, check response document
        if (!documentOpt.isPresent() && demande.getDocumentReponse() != null &&
                demande.getDocumentReponse().getId().equals(documentId)) {
            documentOpt = Optional.of(demande.getDocumentReponse());
        }

        DocumentJustificatif document = documentOpt.orElseThrow(() -> new RuntimeException("Document non trouvé"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(document.getContentType()));
        headers.setContentDisposition(ContentDisposition.attachment().filename(document.getFileName()).build());

        byte[] content = DocumentUtil.decompressDocument(document.getContent());

        return new ResponseEntity<>(content, HttpStatus.OK);
    }

    @GetMapping("/support-users")
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserDTO> getAllSupportUsers() {
        try {
            List<UserDTO> supportUsers = demandeService.getAllSupportUsers();

            return (supportUsers);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @PatchMapping("/{id}/assign/{userId}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<DemandeDTO> assignRequest(@PathVariable Long id, @PathVariable Integer userId) {
        log.info("Controller: assignRequest called - id: {}, userId: {}", id, userId);
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        log.info("Controller: Authentication - {}", auth);
        if (auth != null) {
            log.info("Controller: Authorities - {}", auth.getAuthorities());
        }
        try {
            log.info("Controller: Processing assign request");
            if (userId == null) {
                log.warn("Controller: userId is null");
                return ResponseEntity.badRequest().build();
            }
            log.info("Controller: Calling demandeService.assignRequest");
            DemandeDTO updatedDemande = demandeService.assignRequest(id, userId);
            log.info("Controller: Assign request successful");
            return ResponseEntity.ok(updatedDemande);
        } catch (IllegalArgumentException e) {
            log.error("Controller: IllegalArgumentException - {}", e.getMessage());
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            log.error("Controller: Exception - {}", e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getRequestsCount() {
        try {
            long count = demandeService.getAllDemandes().size();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0L);
        }
    }

    @GetMapping("/count/pending")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Long> getPendingRequestsCount() {
        try {
            long count = demandeService.getAllDemandes().stream()
                    .filter(d -> "EN_ATTENTE".equals(d.getStatut()))
                    .count();
            return ResponseEntity.ok(count);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(0L);
        }
    }

    @GetMapping("/recent")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<DemandeDTO>> getRecentRequests(@RequestParam(defaultValue = "5") int limit) {
        try {
            List<DemandeDTO> recentRequests = demandeService.getAllDemandes().stream()
                    .sorted((a, b) -> b.getDateSoumission().compareTo(a.getDateSoumission()))
                    .limit(limit)
                    .toList();
            return ResponseEntity.ok(recentRequests);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(List.of());
        }

    }

    @PatchMapping(value = "/{id}/update", consumes = "multipart/form-data")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SUPPORT')")
    public ResponseEntity<DemandeDTO> updateDemande(@PathVariable Long id,
            @RequestPart UpdateDemandeRequest request,
            @RequestPart(value = "files", required = false) List<MultipartFile> files) {
        try {
            DemandeDTO updatedDemande = demandeService.updateDemande(id, request, files);
            return ResponseEntity.ok(updatedDemande);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(null);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }
}
