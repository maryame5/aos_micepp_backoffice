package com.example.aos_backend.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "colonie_vacance_service")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ColonieVacanceService extends ServiceEntity {
    private Integer nombreEnfants;
    private String lieuSouhaite;
    private String periode;
}
