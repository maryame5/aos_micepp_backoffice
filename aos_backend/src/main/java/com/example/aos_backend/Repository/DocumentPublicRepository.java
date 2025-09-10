package com.example.aos_backend.Repository;

import com.example.aos_backend.user.DocumentPublic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentPublicRepository extends JpaRepository<DocumentPublic, Long> {
    List<DocumentPublic> findByPublishedByIdOrderByCreatedDateDesc(Integer userId);

    List<DocumentPublic> findByTypeOrderByCreatedDateDesc(String type);

    List<DocumentPublic> findAllByOrderByCreatedDateDesc();
}
