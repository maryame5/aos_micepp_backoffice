package com.example.aos_backend.user;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonBackReference;

import jakarta.persistence.*;
import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "document_justificatif")
@ToString(exclude = { "demande" })
public class DocumentJustificatif {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "content_type")
    private String contentType;

    @Column(name = "file_name")
    private String fileName;

    @Lob
    @Column(name = "content")
    private byte[] content;

    @Column(name = "uploaded_at")
    private LocalDateTime uploadedAt;

    @Column(name = "type")
    private String type;

    @ManyToOne
    @JoinColumn(name = "demande_id", nullable = false)
    @JsonBackReference
    private Demande demande;
}