package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.AdminToken;

@Repository
public interface AdminTokenRepository extends JpaRepository<AdminToken, Integer> {
    Optional<AdminToken> findByToken(String token);
} 