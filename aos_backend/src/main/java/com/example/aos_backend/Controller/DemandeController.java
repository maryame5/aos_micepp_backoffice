package com.example.aos_backend.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Service.DemandeService;
import com.example.aos_backend.Util.DocumentUtil;
import com.example.aos_backend.dto.DemandeDTO;
import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.DocumentJustificatif;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/demandes")
@RequiredArgsConstructor
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

        DocumentJustificatif document = demande.getDocumentsJustificatifs().stream()
                .filter(doc -> doc.getId().equals(documentId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Document non trouvé"));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(document.getContentType()));
        headers.setContentDisposition(ContentDisposition.attachment().filename(document.getFileName()).build());

        byte[] content = DocumentUtil.decompressDocument(document.getContent());

        return new ResponseEntity<>(content, HttpStatus.OK);
    }
}