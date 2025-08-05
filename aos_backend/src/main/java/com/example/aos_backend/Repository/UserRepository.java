package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.aos_backend.user.User;

public interface UserRepository extends JpaRepository<User, Integer> {
    // Additional query methods can be defined here if needed
    Optional<User> findByEmail(String email);
    Optional<User> findByMatricule(String matricule);
    Optional<User> findByCIN(String cin);
    

}
