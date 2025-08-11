package com.example.aos_backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Service.UserManagementService;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserManagementService userManagementService ;

    @PostMapping("/register-user")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<String> registerUser(@RequestBody RegisterationRequest request) {
        try {
            userManagementService.registerUser(request);
            return ResponseEntity.ok("User registered successfully. Welcome email sent with temporary password.");
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        } catch (MessagingException e) {
            return ResponseEntity.badRequest().body("Registration failed: Email could not be sent - " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }
}