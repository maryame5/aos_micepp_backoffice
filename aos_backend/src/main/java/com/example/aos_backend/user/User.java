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

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.*;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@EntityListeners(AuditingEntityListener.class)

@Table(name = "utilisateur")
public class User implements UserDetails, Principal {
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
    private String CIN;
    private String password;
    private boolean accountLocked = true;
    private boolean enabled ;

	@ManyToMany(fetch = FetchType.EAGER)
	@JoinTable(
		name = "user_roles",
		joinColumns = @JoinColumn(name = "user_id"),
		inverseJoinColumns = @JoinColumn(name = "role_id")
	)
	@JsonIgnore
	private List<Role> roles; // e.g., "ROLE_USER", "ROLE_ADMIN"

	@CreatedDate
	@Column(name = "created_date", updatable = false)

	private LocalDateTime createdDate;
	@LastModifiedDate
	@Column(name = "updated_date",insertable = false)

	private LocalDateTime lastModifiedDate;

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
		return false;
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

	public String fullname(){
		return firstname + " " + lastname;

	}
}
