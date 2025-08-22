package com.example.aos_backend.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sante_sociale_service")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class SanteSocialeService extends ServiceEntity {
    private String typeSoin;
    private Double montant;
}
