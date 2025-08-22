package com.example.aos_backend.Service;

import java.util.List;
import java.util.Optional;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.aos_backend.Repository.*;
import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.StatutDemande;
import com.example.aos_backend.user.Utilisateur;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DemandeService {
 private final DemandeRepository demandeRepository;
 private final UtilisateurRepository utilisateurRepository;
 private final ServiceRepository serviceRepository;

 public List<Demande> getDemandeEmail(String userEmail) {

        Utilisateur utilisateur = utilisateurRepository.findByEmail(userEmail)
            .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        return demandeRepository.findByUtilisateur(utilisateur);
    }

    public List<Demande> getAllDemandes() {
        return demandeRepository.findAll();
    }

    public Optional<Demande> getDemandeById(Long id) {
        return demandeRepository.findById(id);
    }

    @Transactional
    public void updateDemandeStatus(Long demandeId, StatutDemande newStatus) {
        Demande demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        
        demande.setStatut(newStatus);
        demandeRepository.save(demande);
    }

    @Transactional
    public void addDocumentReponse(Long demandeId, String documentPath) {
        Demande demande = demandeRepository.findById(demandeId)
            .orElseThrow(() -> new RuntimeException("Demande non trouvée"));
        
        demande.setDocumentReponse(documentPath);
        demandeRepository.save(demande);
    }
}
