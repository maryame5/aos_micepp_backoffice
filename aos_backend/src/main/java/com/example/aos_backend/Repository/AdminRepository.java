package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.Admin;
import com.example.aos_backend.user.Utilisateur;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {
    Optional<Admin> findByUtilisateur(Utilisateur user);
    boolean existsByUtilisateur(Utilisateur user);
} 