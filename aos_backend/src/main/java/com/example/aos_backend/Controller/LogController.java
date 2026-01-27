package com.example.aos_backend.Controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Service.LogService;
import com.example.aos_backend.user.Log;
import com.example.aos_backend.user.Utilisateur;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/logs")
@RequiredArgsConstructor
public class LogController {

    private final LogService logService;

    @GetMapping("/my")
    @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_AGENT', 'ROLE_SUPPORT')")
    public ResponseEntity<List<Log>> getMyLogs(Authentication authentication) {
        Utilisateur user = (Utilisateur) authentication.getPrincipal();
        List<Log> logs = logService.getMyLogs(user.getId());
        return ResponseEntity.ok(logs);
    }

    @GetMapping("/all")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<List<Log>> getAllLogs() {
        List<Log> logs = logService.getAllLogs();
        return ResponseEntity.ok(logs);
    }
}
