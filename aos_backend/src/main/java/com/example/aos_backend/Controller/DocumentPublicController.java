package com.example.aos_backend.Controller;

import com.example.aos_backend.Repository.AdminRepository;
import com.example.aos_backend.Repository.DocumentPublicRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.Service.DocumentPublicService;
import com.example.aos_backend.dto.DocumentPublicDTO;
import com.example.aos_backend.user.Admin;
import com.example.aos_backend.user.DocumentPublic;
import com.example.aos_backend.user.Utilisateur;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/documents-public")
@CrossOrigin(origins = { "http://localhost:4200", "http://localhost:4201", "*" })
@RequiredArgsConstructor
@Tag(name = "Document Public Controller", description = "Controller for managing public documents")
public class DocumentPublicController {

    private final DocumentPublicService documentPublicService;
    private final UtilisateurRepository utilisateurRepository;
    private final AdminRepository adminRepository;
    private final DocumentPublicRepository documentPublicRepository;

    @GetMapping
    public ResponseEntity<List<DocumentPublicDTO>> getAllDocuments() {
        try {
            List<DocumentPublicDTO> documents = documentPublicService.getAllDocuments();
            return ResponseEntity.ok(documents);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<DocumentPublicDTO> getDocumentById(@PathVariable Long id) {
        try {
            DocumentPublicDTO document = documentPublicService.getDocumentById(id);
            if (document == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')OR hasRole('SUPPORT')")
    public ResponseEntity<DocumentPublicDTO> createDocument(
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("type") String type,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            Utilisateur user = utilisateurRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            DocumentPublicDTO document = documentPublicService.createDocument(titre, description, type, file, user);
            return ResponseEntity.status(HttpStatus.CREATED).body(document);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') OR hasRole('SUPPORT')")
    public ResponseEntity<DocumentPublicDTO> updateDocument(
            @PathVariable Long id,
            @RequestParam("titre") String titre,
            @RequestParam("description") String description,
            @RequestParam("type") String type,
            @RequestParam(value = "file", required = false) MultipartFile file) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            Utilisateur user = utilisateurRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            Optional<DocumentPublic> doc = documentPublicRepository.findById(id);
            if (doc.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            DocumentPublic documentPublic = doc.get();
            if (!documentPublic.getPublishedBy().getId().equals(user.getId())
                    && adminRepository.findByUtilisateur(user).isEmpty()) {

                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();

            }
            DocumentPublicDTO document = documentPublicService.updateDocument(id, titre, description, type, file);
            if (document == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(document);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')OR hasRole('SUPPORT')")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String userEmail = authentication.getName();
            Utilisateur user = utilisateurRepository.findByEmail(userEmail)
                    .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

            // Vérifier que l'utilisateur est un admin
            Optional<Admin> adminOpt = adminRepository.findByUtilisateur(user);
            if (adminOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            documentPublicService.deleteDocument(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<byte[]> downloadDocument(@PathVariable Long id) {
        try {
            byte[] content = documentPublicService.downloadDocument(id);
            if (content == null) {
                return ResponseEntity.notFound().build();
            }

            DocumentPublicDTO document = documentPublicService.getDocumentById(id);
            if (document == null) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(document.getContentType()));
            headers.setContentDispositionFormData("attachment", document.getFileName());

            return new ResponseEntity<>(content, headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
