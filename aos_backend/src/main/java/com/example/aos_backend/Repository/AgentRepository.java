package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.Admin;
import com.example.aos_backend.user.Agent;
import com.example.aos_backend.user.Utilisateur;
@Repository
public interface AgentRepository  extends JpaRepository<Agent, Integer> {

    Optional<Agent> findByUtilisateur(Utilisateur user);
    boolean existsByUtilisateur(Utilisateur user);

    
    // This interface can be extended with additional methods specific to Agent if needed

}
