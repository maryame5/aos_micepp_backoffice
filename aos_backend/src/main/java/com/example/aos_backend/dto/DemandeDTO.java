
package com.example.aos_backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DemandeDTO {
    private Integer id;
    private LocalDateTime dateSoumission;

    private String statut;
    private String description;
    private DocumentJustificatifDto documentReponse;
    private String commentaire;

    private Integer utilisateurId;
    private String utilisateurNom;
    private String utilisateurEmail;

    private List<DocumentJustificatifDto> documentsJustificatifs;

    private String serviceNom;
    private Long serviceId;

    private Integer assignedToId;
    private String assignedToUsername;

}
