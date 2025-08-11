package com.example.aos_backend.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Service.UserManagementService;
import com.example.aos_backend.Service.EmailService;
import com.example.aos_backend.Service.EmailTemplateName;

import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
public class TestController{
    
    private final UserManagementService userManagementService;
    private final EmailService emailService ;

    @PostMapping("/register-test-user")
    public ResponseEntity<String> registerTestUser(@RequestBody RegisterationRequest request) {
        try {
            userManagementService.registerUser(request);
            return ResponseEntity.ok("Test user registered successfully. Check email for temporary password.");
        } catch (MessagingException e) {
            return ResponseEntity.badRequest().body("Registration failed: Email could not be sent - " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/test-email")
    public ResponseEntity<String> testEmail(@RequestBody TestEmailRequest request) {
        try {
            emailService.sendEmail(
                request.getEmail(),
                request.getFullName(),
                EmailTemplateName.WELCOME_EMAIL,
                "TestPassword123",
                "USER",
                "Test Email - Welcome to AOS MICEPP"
            );
            return ResponseEntity.ok("Test email sent successfully to " + request.getEmail());
        } catch (MessagingException e) {
            return ResponseEntity.badRequest().body("Email test failed: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Email test failed: " + e.getMessage());
        }
    }
}

class TestEmailRequest {
    private String email;
    private String fullName;
    
    // Getters and setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
} 