package com.example.aos_backend.user;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)
@Table(name = "reclamation")
public class Reclamation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String objet;
    private String contenu;

    @Enumerated(EnumType.STRING)
    private StatutReclamation statut;

    @CreatedDate
    @Column(name = "date_soumission", updatable = false)
    private LocalDateTime dateSoumission;

    @ManyToOne
    @JoinColumn(name = "agent_id", nullable = false)
    private Agent agent;

    @ManyToOne
    @JoinColumn(name = "support_id")
    private Support support;

    @ManyToOne
    @JoinColumn(name = "admin_id")
    private Admin admin;

    @LastModifiedDate
    @Column(name = "updated_date", insertable = false)
    private LocalDateTime lastModifiedDate;
}

enum StatutReclamation {
    EN_ATTENTE, AFFECTEE, EN_COURS, CLOTUREE
}