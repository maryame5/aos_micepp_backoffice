package com.example.aos_backend.user;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
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
@Table(name = "document_public")
public class DocumentPublic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String titre;

    @Column(name = "fichier_path")
    private String fichier;

    @ManyToOne
    @JoinColumn(name = "published_by_admin_id")
    private Admin publishedBy;
    
    @ManyToOne
    @JoinColumn(name = "published_by_support_id")
    private Support publishedBySupport;
    
    @CreatedDate
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;
}
