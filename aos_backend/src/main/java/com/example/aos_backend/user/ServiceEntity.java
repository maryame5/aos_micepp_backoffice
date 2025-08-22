
package com.example.aos_backend.user;

import jakarta.persistence.*;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@Table(name = "service")
public abstract class ServiceEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String nom;
    
    @Column(name = "type")
    private String type;
    
    // Ajout de la relation avec ServiceInfo
    @OneToOne(cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JoinColumn(name = "service_info_id")
    private ServiceInfo serviceInfo;
    
    @Column(name = "is_active")
    private Boolean isActive = true;
}