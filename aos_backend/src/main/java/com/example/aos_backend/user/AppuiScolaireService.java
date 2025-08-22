package com.example.aos_backend.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "appui_scolaire_service")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class AppuiScolaireService extends ServiceEntity {
    private String niveau;
    private String typeAide;
    private Double montantDemande;
}
