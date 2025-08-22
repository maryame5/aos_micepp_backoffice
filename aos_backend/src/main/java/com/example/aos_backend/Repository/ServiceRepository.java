package com.example.aos_backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.aos_backend.user.ServiceEntity;

public interface ServiceRepository extends JpaRepository<ServiceEntity, Long>{
    ServiceEntity findByNom(String nom);
    List<ServiceEntity> findByType(String type);
    List<ServiceEntity> findByIsActive(Boolean isActive);
}