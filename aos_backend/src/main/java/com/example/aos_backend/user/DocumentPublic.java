package com.example.aos_backend.user;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnore;

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
    @Lob
    @Column(columnDefinition = "TEXT")
    @JsonIgnore

    private String description;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_name")
    private String fileName;

    @Lob
    @Column(name = "content")
    @JsonIgnore
    private byte[] content;

    @Column(name = "type")
    private String type;

    @ManyToOne
    @JoinColumn(name = "published_by")
    private Utilisateur publishedBy;

    @CreatedDate
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;
}
