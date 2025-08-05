package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.Support;

@Repository
public interface SupportRepository extends JpaRepository<Support, Integer> {
    Optional<Support> findByEmail(String email);
    Optional<Support> findByCIN(String cin);
    Optional<Support> findByMatricule(String matricule);
    boolean existsByEmail(String email);
    boolean existsByCIN(String cin);
    boolean existsByMatricule(String matricule);
} 