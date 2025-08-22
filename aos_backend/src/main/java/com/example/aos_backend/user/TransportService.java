package com.example.aos_backend.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "transport_service")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TransportService extends ServiceEntity {
    private String trajet;
    private String pointDepart;
    private String pointArrivee;
    private String frequence;
}
