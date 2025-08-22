package com.example.aos_backend.user;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "activite_culturelle_sportive_service")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class ActiviteCulturelleSportiveService extends ServiceEntity {
    private String typeActivite;
    private String nomActivite;
    private String dateActivite;
}
