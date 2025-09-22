package com.example.aos_backend.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.aos_backend.Repository.*;
import com.example.aos_backend.Util.DocumentUtil;
import com.example.aos_backend.dto.DemandeDTO;
import com.example.aos_backend.dto.DocumentJustificatifDto;
import com.example.aos_backend.dto.UpdateDemandeRequest;
import com.example.aos_backend.dto.UserDTO;
import com.example.aos_backend.user.ActiviteCulturelleSportiveService;
import com.example.aos_backend.user.AppuiScolaireService;
import com.example.aos_backend.user.ColonieVacanceService;
import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.DocumentJustificatif;
import com.example.aos_backend.user.LogementService;
import com.example.aos_backend.user.SanteSocialeService;
import com.example.aos_backend.user.ServiceEntity;
import com.example.aos_backend.user.StatutDemande;
import com.example.aos_backend.user.Support;
import com.example.aos_backend.user.TransportService;
import com.example.aos_backend.user.Utilisateur;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class DemandeService {
    private final DemandeRepository demandeRepository;
    private final UtilisateurRepository userRepository;
    private final SupportRepository supportRepository;
    private final StorageRepository storageRepository;

    @Transactional
    public List<DemandeDTO> getAllDemandes() {

        List<Demande> demandes = demandeRepository.findAll();

        for (Demande d : demandes) {
            // Vérifier si la liste des documents est null ou vide
            if (d.getDocumentsJustificatifs() == null) {
                System.out.println("DocumentsJustificatifs: NULL");
            } else if (d.getDocumentsJustificatifs().isEmpty()) {
                System.out.println("DocumentsJustificatifs: EMPTY");
            } else {
                System.out.println("DocumentsJustificatifs count = " + d.getDocumentsJustificatifs().size());
                for (DocumentJustificatif doc : d.getDocumentsJustificatifs()) {
                    System.out.println("  -> Document ID: " + doc.getId() +
                            ", FileName: " + doc.getFileName() +
                            ", ContentType: " + doc.getContentType() +
                            ", UploadedAt: " + doc.getUploadedAt());
                }
            }

            // Vérifier document réponse
            if (d.getDocumentReponse() != null) {
                System.out.println("DocumentReponse ID: " + d.getDocumentReponse().getId() +
                        ", FileName: " + d.getDocumentReponse().getFileName());
            } else {
                System.out.println("DocumentReponse: NULL");
            }
        }

        try {
            return demandes.stream().map(d -> DemandeDTO.builder()
                    .id(d.getId())
                    .description(d.getDescription())
                    .commentaire(d.getCommentaire())
                    .statut(d.getStatut().name())
                    .dateSoumission(d.getDateSoumission())
                    .utilisateurId(d.getUtilisateur().getId())
                    .utilisateurNom(d.getUtilisateur().fullname())
                    .utilisateurEmail(d.getUtilisateur().getEmail())
                    .serviceId(d.getService().getId())
                    .serviceNom(d.getService().getNom())
                    .documentsJustificatifs(d.getDocumentsJustificatifs() != null
                            ? d.getDocumentsJustificatifs().stream()
                                    .map(doc -> DocumentJustificatifDto.builder()
                                            .id(doc.getId())
                                            .fileName(doc.getFileName())
                                            .contentType(doc.getContentType())
                                            .type(doc.getType())
                                            .uploadedAt(doc.getUploadedAt() != null ? doc.getUploadedAt() : null)
                                            .build())
                                    .toList()
                            : List.of())
                    .documentReponse(d.getDocumentReponse() != null
                            ? DocumentJustificatifDto.builder()
                                    .id(d.getDocumentReponse().getId())
                                    .fileName(d.getDocumentReponse().getFileName())
                                    .contentType(d.getDocumentReponse().getContentType())
                                    .type(d.getDocumentReponse().getType())
                                    .uploadedAt(d.getDocumentReponse().getUploadedAt() != null
                                            ? d.getDocumentReponse().getUploadedAt()
                                            : null)
                                    .build()
                            : null)
                    .assignedToId(d.getAssignedTo() != null ? d.getAssignedTo().getId() : null)
                    .assignedToUsername(
                            d.getAssignedTo() != null ? d.getAssignedTo().fullname() : null)
                    .build()).toList();

        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public Demande getDemandById(Long id) {
        return demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée pour l'ID: " + id));
    }

    @Transactional
    public List<DemandeDTO> getRequestsAssignedToUser(Integer userId) {
        Utilisateur user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé pour l'ID: " + userId));

        List<Demande> demandes = demandeRepository.findByAssignedTo(user);

        return demandes.stream().map(d -> DemandeDTO.builder()
                .id(d.getId())
                .description(d.getDescription())
                .statut(d.getStatut().name())
                .commentaire(d.getCommentaire())
                .dateSoumission(d.getDateSoumission())
                .utilisateurId(d.getUtilisateur().getId())
                .utilisateurNom(d.getUtilisateur().fullname())
                .utilisateurEmail(d.getUtilisateur().getEmail())
                .serviceId(d.getService().getId())
                .serviceNom(d.getService().getNom())
                .documentsJustificatifs(d.getDocumentsJustificatifs() != null
                        ? d.getDocumentsJustificatifs().stream()
                                .map(doc -> DocumentJustificatifDto.builder()
                                        .id(doc.getId())
                                        .fileName(doc.getFileName())
                                        .contentType(doc.getContentType())
                                        .type(doc.getType())
                                        .uploadedAt(doc.getUploadedAt() != null ? doc.getUploadedAt() : null)
                                        .build())
                                .toList()
                        : List.of())
                .documentReponse(d.getDocumentReponse() != null
                        ? DocumentJustificatifDto.builder()
                                .id(d.getDocumentReponse().getId())
                                .fileName(d.getDocumentReponse().getFileName())
                                .contentType(d.getDocumentReponse().getContentType())
                                .type(d.getDocumentReponse().getType())
                                .uploadedAt(d.getDocumentReponse().getUploadedAt() != null
                                        ? d.getDocumentReponse().getUploadedAt()
                                        : null)
                                .build()
                        : null)
                .assignedToId(d.getAssignedTo() != null ? d.getAssignedTo().getId() : null)
                .assignedToUsername(d.getAssignedTo() != null ? d.getAssignedTo().fullname() : null)
                .build()).toList();
    }

    @Transactional
    public DemandeDTO getDemandeById(Long id) {
        Optional<Demande> demandeOpt = demandeRepository.findById(id);
        if (demandeOpt.isEmpty()) {
            throw new RuntimeException("Demande not found for ID: " + id);
        }
        Demande d = demandeOpt.get();
        return DemandeDTO.builder()
                .id(d.getId())
                .description(d.getDescription())
                .statut(d.getStatut().name())
                .commentaire(d.getCommentaire())
                .dateSoumission(d.getDateSoumission())
                .utilisateurId(d.getUtilisateur().getId())
                .utilisateurNom(d.getUtilisateur().fullname())
                .utilisateurEmail(d.getUtilisateur().getEmail())
                .serviceId(d.getService().getId())
                .serviceNom(d.getService().getNom())
                .documentsJustificatifs(d.getDocumentsJustificatifs() != null
                        ? d.getDocumentsJustificatifs().stream()
                                .map(doc -> DocumentJustificatifDto.builder()
                                        .id(doc.getId())
                                        .fileName(doc.getFileName())
                                        .contentType(doc.getContentType())
                                        .type(doc.getType())
                                        .uploadedAt(doc.getUploadedAt() != null ? doc.getUploadedAt() : null)
                                        .build())
                                .toList()
                        : List.of())
                .documentReponse(d.getDocumentReponse() != null
                        ? DocumentJustificatifDto.builder()
                                .id(d.getDocumentReponse().getId())
                                .fileName(d.getDocumentReponse().getFileName())
                                .contentType(d.getDocumentReponse().getContentType())
                                .type(d.getDocumentReponse().getType())
                                .uploadedAt(d.getDocumentReponse().getUploadedAt() != null
                                        ? d.getDocumentReponse().getUploadedAt()
                                        : null)
                                .build()
                        : null)
                .assignedToId(d.getAssignedTo() != null ? d.getAssignedTo().getId() : null)
                .assignedToUsername(d.getAssignedTo() != null ? d.getAssignedTo().fullname() : null)
                .build();
    }

    @Transactional
    public Map<String, Object> getDemandeServiceData(Long demandeId) {
        Optional<Demande> demandeOpt = demandeRepository.findById(demandeId);
        if (demandeOpt.isEmpty()) {
            log.warn("Demande not found for ID: {}", demandeId);
            return new HashMap<>();
        }

        Demande demande = demandeOpt.get();
        ServiceEntity service = demande.getService();

        return extractServiceSpecificData(service);
    }

    @Transactional
    public List<UserDTO> getAllSupportUsers() {
        List<Support> supports = supportRepository.findAll();
        return supports.stream().map(sup -> UserDTO.builder()
                .id(sup.getId())
                .firstname(sup.getUtilisateur().getFirstname())
                .lastname(sup.getUtilisateur().getLastname())
                .email(sup.getUtilisateur().getEmail())

                .build()).toList();
    }

    @Transactional
    public DemandeDTO assignRequest(Long id, Integer userId) {
        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée pour l'ID: " + id));
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
        demande.setAssignedTo(user);
        demande.setLastModifiedDate(new java.sql.Timestamp(System.currentTimeMillis()).toLocalDateTime());
        demande = demandeRepository.save(demande);
        return DemandeDTO.builder()
                .id(demande.getId())
                .description(demande.getDescription())
                .statut(demande.getStatut().name())
                .dateSoumission(demande.getDateSoumission())
                .commentaire(demande.getCommentaire())
                .utilisateurId(demande.getUtilisateur().getId())
                .utilisateurNom(demande.getUtilisateur().fullname())
                .utilisateurEmail(demande.getUtilisateur().getEmail())
                .serviceId(demande.getService().getId())
                .serviceNom(demande.getService().getNom())
                .documentsJustificatifs(demande.getDocumentsJustificatifs() != null
                        ? demande.getDocumentsJustificatifs().stream()
                                .map(doc -> DocumentJustificatifDto.builder()
                                        .id(doc.getId())
                                        .fileName(doc.getFileName())
                                        .contentType(doc.getContentType())
                                        .type(doc.getType())
                                        .uploadedAt(doc.getUploadedAt() != null ? doc.getUploadedAt() : null)
                                        .build())
                                .toList()
                        : List.of())
                .documentReponse(demande.getDocumentReponse() != null
                        ? DocumentJustificatifDto.builder()
                                .id(demande.getDocumentReponse().getId())
                                .fileName(demande.getDocumentReponse().getFileName())
                                .contentType(demande.getDocumentReponse().getContentType())
                                .type(demande.getDocumentReponse().getType())
                                .uploadedAt(demande.getDocumentReponse().getUploadedAt() != null
                                        ? demande.getDocumentReponse().getUploadedAt()
                                        : null)
                                .build()
                        : null)
                .assignedToId(demande.getAssignedTo() != null ? demande.getAssignedTo().getId() : null)
                .assignedToUsername(demande.getAssignedTo() != null ? demande.getAssignedTo().fullname() : null)
                .build();
    }

    private Map<String, Object> extractServiceSpecificData(ServiceEntity service) {
        Map<String, Object> data = new HashMap<>();
        String serviceType = service.getType();

        switch (serviceType) {
            case "TransportService":
                TransportService transportService = (TransportService) service;
                data.put("trajet", transportService.getTrajet());
                data.put("pointDepart", transportService.getPointDepart());
                data.put("pointArrivee", transportService.getPointArrivee());
                data.put("frequence", transportService.getFrequence());
                break;

            case "SanteSocialeService":
                SanteSocialeService santeService = (SanteSocialeService) service;
                data.put("typeSoin", santeService.getTypeSoin());
                data.put("montant", santeService.getMontant());
                break;

            case "LogementService":
                LogementService logementService = (LogementService) service;
                data.put("typeLogement", logementService.getTypeLogement());
                data.put("localisationSouhaitee", logementService.getLocalisationSouhaitee());
                data.put("montantParticipation", logementService.getMontantParticipation());
                break;

            case "ColonieVacanceService":
                ColonieVacanceService colonieService = (ColonieVacanceService) service;
                data.put("nombreEnfants", colonieService.getNombreEnfants());
                data.put("lieuSouhaite", colonieService.getLieuSouhaite());
                data.put("periode", colonieService.getPeriode());
                break;

            case "AppuiScolaireService":
                AppuiScolaireService appuiService = (AppuiScolaireService) service;
                data.put("niveau", appuiService.getNiveau());
                data.put("typeAide", appuiService.getTypeAide());
                data.put("montantDemande", appuiService.getMontantDemande());
                break;

            case "ActiviteCulturelleSportiveService":
                ActiviteCulturelleSportiveService activiteService = (ActiviteCulturelleSportiveService) service;
                data.put("typeActivite", activiteService.getTypeActivite());
                data.put("nomActivite", activiteService.getNomActivite());
                data.put("dateActivite", activiteService.getDateActivite());
                break;
        }

        return data;
    }

    // Service-specific data processing methods
    private void processTransportServiceData(TransportService service, Map<String, Object> data) {
        if (data.containsKey("trajet")) {
            service.setTrajet((String) data.get("trajet"));
        }
        if (data.containsKey("pointDepart")) {
            service.setPointDepart((String) data.get("pointDepart"));
        }
        if (data.containsKey("pointArrivee")) {
            service.setPointArrivee((String) data.get("pointArrivee"));
        }
        if (data.containsKey("frequence")) {
            service.setFrequence((String) data.get("frequence"));
        }
    }

    private void processSanteSocialeServiceData(SanteSocialeService service, Map<String, Object> data) {
        if (data.containsKey("typeSoin")) {
            service.setTypeSoin((String) data.get("typeSoin"));
        }
        if (data.containsKey("montant")) {
            service.setMontant(Double.valueOf(data.get("montant").toString()));
        }
    }

    private void processLogementServiceData(LogementService service, Map<String, Object> data) {
        if (data.containsKey("typeLogement")) {
            service.setTypeLogement((String) data.get("typeLogement"));
        }
        if (data.containsKey("localisationSouhaitee")) {
            service.setLocalisationSouhaitee((String) data.get("localisationSouhaitee"));
        }
        if (data.containsKey("montantParticipation")) {
            service.setMontantParticipation(Double.valueOf(data.get("montantParticipation").toString()));
        }
    }

    private void processColonieVacanceServiceData(ColonieVacanceService service, Map<String, Object> data) {
        if (data.containsKey("nombreEnfants")) {
            service.setNombreEnfants(Integer.valueOf(data.get("nombreEnfants").toString()));
        }
        if (data.containsKey("lieuSouhaite")) {
            service.setLieuSouhaite((String) data.get("lieuSouhaite"));
        }
        if (data.containsKey("periode")) {
            service.setPeriode((String) data.get("periode"));
        }
    }

    private void processAppuiScolaireServiceData(AppuiScolaireService service, Map<String, Object> data) {
        if (data.containsKey("niveau")) {
            service.setNiveau((String) data.get("niveau"));
        }
        if (data.containsKey("typeAide")) {
            service.setTypeAide((String) data.get("typeAide"));
        }
        if (data.containsKey("montantDemande")) {
            service.setMontantDemande(Double.valueOf(data.get("montantDemande").toString()));
        }
    }

    private void processActiviteCulturelleSportiveServiceData(ActiviteCulturelleSportiveService service,
            Map<String, Object> data) {
        if (data.containsKey("typeActivite")) {
            service.setTypeActivite((String) data.get("typeActivite"));
        }
        if (data.containsKey("nomActivite")) {
            service.setNomActivite((String) data.get("nomActivite"));
        }
        if (data.containsKey("dateActivite")) {
            service.setDateActivite((String) data.get("dateActivite"));
        }
    }

    @Transactional
    public DemandeDTO updateDemande(Long id, UpdateDemandeRequest request, List<MultipartFile> files) {

        log.info("Updating demande ID: {}", id);
        log.info("Update request: {}", request);
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String userEmail = authentication.getName();
        Utilisateur currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé avec l'email: " + userEmail));

        Demande demande = demandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Demande non trouvée"));

        Utilisateur assigner = demande.getAssignedTo();

        boolean isAdmin = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("ADMIN"));
        boolean isSupport = currentUser.getRoles().stream()
                .anyMatch(role -> role.getName().equals("SUPPORT"));

        if (isAdmin || (isSupport && assigner != null && currentUser.equals(assigner))) {
            boolean hasUpdates = false;

            if (request.getCommentaire() != null) {
                demande.setCommentaire(request.getCommentaire());
                hasUpdates = true;
            }

            if (request.getStatut() != null) {
                StatutDemande newStatut;
                try {
                    newStatut = StatutDemande.valueOf(request.getStatut());
                } catch (IllegalArgumentException e) {
                    throw new IllegalArgumentException("Statut invalide: " + request.getStatut());
                }
                demande.setStatut(newStatut);
                hasUpdates = true;
            }

            if (files != null && !files.isEmpty()) {
                for (MultipartFile file : files) {
                    try {
                        DocumentJustificatif document = new DocumentJustificatif();
                        document.setFileName(file.getOriginalFilename());
                        document.setContentType(file.getContentType());
                        document.setContent(DocumentUtil.compressDocument(file.getBytes()));
                        document.setUploadedAt(java.time.LocalDateTime.now());
                        document.setType("reponse");
                        document.setDemande(demande);
                        demande.setDocumentReponse(document);

                        storageRepository.save(document);
                        hasUpdates = true;
                    } catch (Exception e) {
                        throw new RuntimeException(
                                "Erreur lors du téléchargement du fichier: " + file.getOriginalFilename(), e);
                    }
                }
            }

            if (hasUpdates) {
                log.info("Saving updates to demande ID: {}", id);
                log.info("demande", demande);
                demande = demandeRepository.save(demande);
                log.info("demande enregistre", demande);
            }

            return DemandeDTO.builder()
                    .id(demande.getId())
                    .description(demande.getDescription())
                    .statut(demande.getStatut().name())
                    .commentaire(demande.getCommentaire())
                    .dateSoumission(demande.getDateSoumission())
                    .utilisateurId(demande.getUtilisateur().getId())
                    .utilisateurNom(demande.getUtilisateur().fullname())
                    .utilisateurEmail(demande.getUtilisateur().getEmail())
                    .serviceId(demande.getService().getId())
                    .serviceNom(demande.getService().getNom())
                    .documentsJustificatifs(demande.getDocumentsJustificatifs() != null
                            ? demande.getDocumentsJustificatifs().stream()
                                    .map(doc -> DocumentJustificatifDto.builder()
                                            .id(doc.getId())
                                            .fileName(doc.getFileName())
                                            .contentType(doc.getContentType())
                                            .type(doc.getType())
                                            .uploadedAt(doc.getUploadedAt() != null ? doc.getUploadedAt() : null)
                                            .build())
                                    .toList()
                            : List.of())
                    .documentReponse(demande.getDocumentReponse() != null
                            ? DocumentJustificatifDto.builder()
                                    .id(demande.getDocumentReponse().getId())
                                    .fileName(demande.getDocumentReponse().getFileName())
                                    .contentType(demande.getDocumentReponse().getContentType())
                                    .type(demande.getDocumentReponse().getType())
                                    .uploadedAt(demande.getDocumentReponse().getUploadedAt() != null
                                            ? demande.getDocumentReponse().getUploadedAt()
                                            : null)
                                    .build()
                            : null)
                    .assignedToId(demande.getAssignedTo() != null ? demande.getAssignedTo().getId() : null)
                    .assignedToUsername(demande.getAssignedTo() != null ? demande.getAssignedTo().fullname() : null)
                    .build();
        } else {
            throw new RuntimeException("Utilisateur non autorisé à mettre à jour cette demande");
        }
    }
}
