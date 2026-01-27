package com.example.aos_backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.aos_backend.user.Log;

@Repository
public interface LogRepository extends JpaRepository<Log, Long> {
    List<Log> findByUserIdOrderByTimestampDesc(Integer userId);

    @Query("SELECT l FROM Log l ORDER BY l.timestamp DESC")
    List<Log> findAllOrderByTimestampDesc();
}
