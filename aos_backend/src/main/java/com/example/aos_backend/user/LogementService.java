package com.example.aos_backend.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "logement_service")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class LogementService extends ServiceEntity {
    private String typeLogement;
    private String localisationSouhaitee;
    private Double montantParticipation;
}
