package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.Utilisateur;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
    Optional<Utilisateur> findByEmail(String email);
    Optional<Utilisateur> findByCin(String cin);
    Optional<Utilisateur> findByMatricule(String matricule);

    boolean existsByEmail(String email);
    boolean existsByCin(String cin);
    boolean existsByMatricule(String matricule);
    
}