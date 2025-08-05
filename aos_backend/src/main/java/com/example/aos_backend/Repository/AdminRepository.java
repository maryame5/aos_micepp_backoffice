package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.Admin;

@Repository
public interface AdminRepository extends JpaRepository<Admin, Integer> {
    Optional<Admin> findByEmail(String email);
    Optional<Admin> findByCIN(String cin);
    Optional<Admin> findByMatricule(String matricule);
    boolean existsByEmail(String email);
    boolean existsByCIN(String cin);
    boolean existsByMatricule(String matricule);
} 