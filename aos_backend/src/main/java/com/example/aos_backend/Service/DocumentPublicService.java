package com.example.aos_backend.Service;

import com.example.aos_backend.Repository.DocumentPublicRepository;
import com.example.aos_backend.Util.DocumentUtil;
import com.example.aos_backend.dto.DocumentPublicDTO;
import com.example.aos_backend.user.DocumentPublic;
import com.example.aos_backend.user.Utilisateur;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentPublicService {

    private final DocumentPublicRepository documentPublicRepository;

    @Transactional
    public List<DocumentPublicDTO> getAllDocuments() {
        return documentPublicRepository.findAllByOrderByCreatedDateDesc()
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public DocumentPublicDTO getDocumentById(Long id) {
        return documentPublicRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);
    }

    @Transactional
    public DocumentPublicDTO createDocument(String titre, String description, String type, MultipartFile file,
            Utilisateur user) {
        try {
            DocumentPublic document = new DocumentPublic();
            document.setTitre(titre);
            document.setDescription(description);
            document.setType(type);
            document.setPublishedBy(user);

            if (file != null && !file.isEmpty()) {
                document.setFileName(file.getOriginalFilename());
                document.setContentType(file.getContentType());
                document.setContent(DocumentUtil.compressDocument(file.getBytes()));
            }

            document = documentPublicRepository.save(document);
            return convertToDTO(document);
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la création du document: " + e.getMessage(), e);
        }
    }

    @Transactional
    public DocumentPublicDTO updateDocument(Long id, String titre, String description, String type,
            MultipartFile file) {

        return documentPublicRepository.findById(id)
                .map(document -> {
                    try {
                        document.setTitre(titre);
                        document.setDescription(description);
                        document.setType(type);

                        if (file != null && !file.isEmpty()) {
                            document.setFileName(file.getOriginalFilename());
                            document.setContentType(file.getContentType());
                            document.setContent(DocumentUtil.compressDocument(file.getBytes()));
                        }

                        return convertToDTO(documentPublicRepository.save(document));
                    } catch (Exception e) {
                        throw new RuntimeException("Erreur lors de la mise à jour du document: " + e.getMessage(), e);
                    }
                })
                .orElse(null);
    }

    @Transactional
    public void deleteDocument(Long id) {
        documentPublicRepository.deleteById(id);
    }

    @Transactional
    public byte[] downloadDocument(Long id) {
        return documentPublicRepository.findById(id)
                .map(document -> DocumentUtil.decompressDocument(document.getContent()))
                .orElse(null);
    }

    @Transactional
    private DocumentPublicDTO convertToDTO(DocumentPublic document) {
        return DocumentPublicDTO.builder()
                .id(document.getId())
                .titre(document.getTitre())
                .description(document.getDescription())
                .contentType(document.getContentType())
                .fileName(document.getFileName())
                .type(document.getType())
                .publishedByName(document.getPublishedBy() != null ? document.getPublishedBy().fullname() : null)
                .createdDate(document.getCreatedDate())
                .uploadedAt(document.getCreatedDate())
                .published(true)
                .build();
    }
}
