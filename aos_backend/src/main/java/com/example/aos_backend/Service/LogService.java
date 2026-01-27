package com.example.aos_backend.Service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.aos_backend.Repository.LogRepository;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.user.Log;
import com.example.aos_backend.user.Utilisateur;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LogService {
    private final LogRepository logRepository;
    private final UtilisateurRepository utilisateurRepository;

    public void saveLog(Integer userId, String action, String details) {
        Log log = Log.builder()
                .userId(userId)
                .action(action)
                .details(details)
                .build();
        logRepository.save(log);
    }

    public List<Log> getMyLogs(Integer userId) {
        return logRepository.findByUserIdOrderByTimestampDesc(userId);
    }

    public List<Log> getAllLogs() {
        List<Log> logs = logRepository.findAllOrderByTimestampDesc();
        // Optionally enrich with user info if needed, but for now return as is
        return logs;
    }

    // Helper to get user name for display
    public String getUserName(Integer userId) {
        return utilisateurRepository.findById(userId)
                .map(u -> u.getFirstname() + " " + u.getLastname())
                .orElse("Unknown User");
    }
}
