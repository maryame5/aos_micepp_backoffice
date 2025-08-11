package com.example.aos_backend.user;

import java.time.LocalDateTime;

import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@Builder

@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "token")
public class Token {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String token;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "expires_at")
    private LocalDateTime expiresAt;
    private LocalDateTime validatedAt;

    @ManyToOne
    @JoinColumn(name = "utilisateur_id", nullable = false)
    private Utilisateur utilisateur;
}