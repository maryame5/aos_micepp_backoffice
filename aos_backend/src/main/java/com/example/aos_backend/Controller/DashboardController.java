package com.example.aos_backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import lombok.RequiredArgsConstructor;
import com.example.aos_backend.Service.DashboardService;
import com.example.aos_backend.user.Utilisateur;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            Map<String, Object> stats = dashboardService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/system-status")
    public ResponseEntity<Map<String, Object>> getSystemStatus() {
        try {
            Map<String, Object> status = dashboardService.getSystemStatus();
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/system-status/refresh")
    public ResponseEntity<Map<String, Object>> refreshSystemStatus() {
        try {
            Map<String, Object> status = dashboardService.refreshSystemStatus();
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/user-stats/{userId}")
    public ResponseEntity<Map<String, Object>> getUserStats(@PathVariable String userId) {
        try {
            Map<String, Object> stats = dashboardService.getUserStats(userId);
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reports/generate")
    public ResponseEntity<Map<String, String>> generateReports() {
        try {
            String reportUrl = dashboardService.generateReports();
            return ResponseEntity.ok(Map.of("reportUrl", reportUrl));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("error", e.getMessage()));
        }
    }
}

