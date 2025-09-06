package com.example.aos_backend.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.aos_backend.user.Reclamation;

public interface ReclamationRepository extends JpaRepository<Reclamation, Long> {

    List<Reclamation> findAll();

    List<Reclamation> findByStatut(String status);

    Optional<Reclamation> findById(Long id);

}
