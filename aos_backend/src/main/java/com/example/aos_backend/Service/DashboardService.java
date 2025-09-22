package com.example.aos_backend.Service;

import org.springframework.stereotype.Service;
import lombok.RequiredArgsConstructor;
import com.example.aos_backend.Repository.UtilisateurRepository;
import com.example.aos_backend.Repository.DemandeRepository;
import com.example.aos_backend.user.Utilisateur;
import com.example.aos_backend.user.Demande;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UtilisateurRepository utilisateurRepository;
    private final DemandeRepository demandeRepository;

    public Map<String, Object> getDashboardStats() {
        Map<String, Object> stats = new HashMap<>();

        try {
            // Total users
            long totalUsers = utilisateurRepository.count();
            stats.put("totalUsers", totalUsers);

            // Total requests
            long totalRequests = demandeRepository.count();
            stats.put("totalRequests", totalRequests);

            // Pending requests
            long pendingRequests = demandeRepository.countByStatus("EN_ATTENTE");
            stats.put("pendingRequests", pendingRequests);

            // Completed requests
            long completedRequests = demandeRepository.countByStatus("ACCEPTEE");
            stats.put("completedRequests", completedRequests);

            // Satisfaction rate (mock data for now)
            double satisfactionRate = 98.5;
            stats.put("satisfactionRate", satisfactionRate);

            // Users change this month
            LocalDateTime startOfMonth = LocalDate.now().withDayOfMonth(1).atStartOfDay();
            long usersThisMonth = utilisateurRepository.countByCreatedDateAfter(startOfMonth);
            stats.put("usersChangeThisMonth", usersThisMonth);

            // Requests change today
            LocalDateTime startOfDay = LocalDate.now().atStartOfDay();
            long requestsToday = demandeRepository.countByCreatedAtAfter(startOfDay);
            stats.put("requestsChangeToday", requestsToday);

            // Satisfaction change this month (mock data)
            double satisfactionChangeThisMonth = 2.1;
            stats.put("satisfactionChangeThisMonth", satisfactionChangeThisMonth);

            // Average resolution time (mock data)
            double averageResolutionTime = 3.5;
            stats.put("averageResolutionTime", averageResolutionTime);

        } catch (Exception e) {
            // Fallback to mock data if database queries fail
            stats.put("totalUsers", 156);
            stats.put("totalRequests", 342);
            stats.put("pendingRequests", 23);
            stats.put("completedRequests", 298);
            stats.put("satisfactionRate", 98.5);
            stats.put("usersChangeThisMonth", 12);
            stats.put("requestsChangeToday", 8);
            stats.put("satisfactionChangeThisMonth", 2.1);
            stats.put("averageResolutionTime", 3.5);
        }

        return stats;
    }

    public Map<String, Object> getSystemStatus() {
        Map<String, Object> status = new HashMap<>();

        // Mock system status
        status.put("server", "online");
        status.put("database", "online");
        status.put("storage", Map.of(
                "status", "warning",
                "usagePercentage", 75));
        status.put("api", "online");
        status.put("lastUpdated", LocalDateTime.now());

        return status;
    }

    public Map<String, Object> refreshSystemStatus() {
        // In a real application, this would check actual system status
        return getSystemStatus();
    }

    public Map<String, Object> getUserStats(String userId) {
        Map<String, Object> stats = new HashMap<>();

        // Mock user statistics
        stats.put("processedRequests", 15);
        stats.put("averageResponseTime", 2.3);
        stats.put("completionRate", 95.2);
        stats.put("lastActivity", LocalDateTime.now());

        return stats;
    }

    public String generateReports() {
        // Mock report generation
        return "/reports/dashboard-report-" + System.currentTimeMillis() + ".pdf";
    }
}
