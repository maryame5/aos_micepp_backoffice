package com.example.aos_backend.user;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.experimental.SuperBuilder;

import jakarta.persistence.*;
import lombok.*;


@Entity 
@Table(name = "utilisateur") // optionnel mais conseillé
@SuperBuilder
@Getter
@Setter
@Inheritance(strategy = InheritanceType.TABLE_PER_CLASS)
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Utilisateur implements UserDetails, Principal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String firstname;
    private String lastname;

    @Column(unique = true)
    private String email;

    private String phone;

    @Column(unique = true)
    private String matricule;

    @Column(name = "cin", unique = true)
    private String cin;

    private String password;
    @Builder.Default
    private boolean accountLocked = false;

    @Builder.Default
    private boolean enabled = true;

    @Column(name = "using_temporary_password", nullable = false, columnDefinition = "boolean default false")
    @Builder.Default
    private boolean usingTemporaryPassword = false;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "utilisateur_roles",
        joinColumns = @JoinColumn(name = "utilisateur_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id"),
        uniqueConstraints = @UniqueConstraint(name = "uk_utilisateur_roles", columnNames = {"utilisateur_id", "role_id"})
    )
    @JsonIgnore
    private List<Role> roles;

    @CreatedDate
    @Column(name = "created_date", updatable = false)
    private LocalDateTime createdDate;

    @LastModifiedDate
    @Column(name = "updated_date", insertable = false)
    private LocalDateTime lastModifiedDate;

    @OneToMany(mappedBy = "utilisateur", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnore
    private List<Token> tokens;


    
    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        if (this.roles == null || this.roles.isEmpty()) {
            return List.of();
        }
        return this.roles.stream()
                .map(r -> new SimpleGrantedAuthority(r.getName()))
                .collect(Collectors.toList());
    }

    @Override
    public String getName() {
        return getUsername();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return !accountLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return enabled;
    }

    public String fullname() {
        return firstname + " " + lastname;
    }

    
}