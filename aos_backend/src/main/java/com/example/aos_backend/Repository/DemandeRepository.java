package com.example.aos_backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import com.example.aos_backend.user.Demande;
import com.example.aos_backend.user.Utilisateur;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DemandeRepository extends JpaRepository<Demande, Long> {
    
    @Query("SELECT COUNT(d) FROM Demande d WHERE d.statut = :status")
    long countByStatus(@Param("status") String status);
    
    @Query("SELECT COUNT(d) FROM Demande d WHERE d.dateSoumission >= :date")
    long countByCreatedAtAfter(@Param("date") LocalDateTime date);
    
    @Query("SELECT d FROM Demande d ORDER BY d.dateSoumission DESC")
    List<Demande> findRecentDemandes();
    
    @Query("SELECT d FROM Demande d WHERE d.utilisateur.id = :utilisateurId ORDER BY d.dateSoumission DESC")
    List<Demande> findByUtilisateurId(@Param("utilisateurId") Integer utilisateurId);

    List<Demande> findByUtilisateur(Utilisateur utilisateur);
}
