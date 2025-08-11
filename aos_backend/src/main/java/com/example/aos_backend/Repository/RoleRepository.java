package com.example.aos_backend.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.Role;
@Repository
public interface RoleRepository extends JpaRepository<Role, Integer> {

    Optional<Role> findByName(String name);
}
