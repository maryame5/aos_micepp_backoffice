package com.example.aos_backend.user;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "service")
public abstract class Service {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    private String description;
}

@Entity
@Table(name = "transport_service")
class TransportService extends Service {
    private String trajet;
    private String pointDepart;
    private String pointArrivee;
    private String frequence;
}

@Entity
@Table(name = "sante_sociale_service")
class SanteSocialeService extends Service {
    private String typeSoin;
    private Double montant;
}

@Entity
@Table(name = "logement_service")
class LogementService extends Service {
    private String typeLogement;
    private String localisationSouhaitee;
    private Double montantParticipation;
}

@Entity
@Table(name = "colonie_vacance_service")
class ColonieVacanceService extends Service {
    private Integer nombreEnfants;
    private String lieuSouhaite;
    private String periode;
}

@Entity
@Table(name = "appui_scolaire_service")
class AppuiScolaireService extends Service {
    private String niveau;
    private String typeAide;
    private Double montantDemande;
}

@Entity
@Table(name = "activite_culturelle_sportive_service")
class ActiviteCulturelleSportiveService extends Service {
    private String typeActivite;
    private String nomActivite;
    private String dateActivite;
}