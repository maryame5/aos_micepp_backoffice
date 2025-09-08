package com.example.aos_backend.Repository;

import com.example.aos_backend.user.ServiceInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ServiceInfoRepository extends JpaRepository<ServiceInfo, Long> {
}
