package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.Support;
import com.example.aos_backend.user.Utilisateur;

@Repository
public interface SupportRepository extends JpaRepository<Support, Integer> {

     boolean existsByUtilisateur(Utilisateur user);
        Optional<Support> findByUtilisateur(Utilisateur user);
} 