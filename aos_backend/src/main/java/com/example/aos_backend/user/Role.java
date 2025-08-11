package com.example.aos_backend.user;

import java.time.LocalDateTime;
import java.util.List;

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
@Table(name = "role")
public class Role {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(unique = true)
    private String name; // e.g., "ROLE_ADMIN", "ROLE_SUPPORT", "ROLE_AGENT"

    @ManyToMany(mappedBy = "roles")
    private List<Utilisateur> utilisateurs;

    @CreatedDate
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name = "updated_date", insertable = false)
    private LocalDateTime lastModifiedDate;


    public String getName() {
        return name;
    }
}
