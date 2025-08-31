package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.aos_backend.user.DocumentJustificatif;

public interface StorageRepository extends JpaRepository<DocumentJustificatif, Long> {
    // Méthodes personnalisées pour le stockage des documents
    DocumentJustificatif findByFileName(String fileName);

    DocumentJustificatif findById(long id);

    Optional<DocumentJustificatif> findByDemandeId(long demandeId);

    DocumentJustificatif findByContentType(String contentType);
}
