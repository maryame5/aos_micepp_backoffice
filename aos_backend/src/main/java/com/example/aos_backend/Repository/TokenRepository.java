package com.example.aos_backend.Repository;


import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.aos_backend.user.Token;


public interface TokenRepository extends JpaRepository<Token, Integer>{
Optional<Token> findByToken(String token);  


}
