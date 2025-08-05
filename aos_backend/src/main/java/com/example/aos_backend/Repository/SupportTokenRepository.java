package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.SupportToken;

@Repository
public interface SupportTokenRepository extends JpaRepository<SupportToken, Integer> {
    Optional<SupportToken> findByToken(String token);
} 