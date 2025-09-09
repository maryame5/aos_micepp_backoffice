package com.example.aos_backend.user;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "service_info")
public class ServiceInfo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String icon;
    @Column(unique = true)
    private String title;
    private String description;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "service_features", joinColumns = @JoinColumn(name = "service_info_id"), uniqueConstraints = @UniqueConstraint(columnNames = {
            "service_info_id", "feature" }))
    @Column(name = "feature")
    private List<String> features;
}
