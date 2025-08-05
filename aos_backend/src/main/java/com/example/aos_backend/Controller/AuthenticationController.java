package com.example.aos_backend.Controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.aos_backend.Service.AuthenticationService;
import com.example.aos_backend.Service.ComprehensiveAuthService;
import com.example.aos_backend.Service.PasswordChangeService;
import com.example.aos_backend.Controller.RegisterationRequest;
import com.example.aos_backend.Controller.LoginRequest;
import com.example.aos_backend.Controller.PasswordChangeRequest;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.mail.MessagingException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication")
public class AuthenticationController {
    private final AuthenticationService service;
    private final ComprehensiveAuthService comprehensiveAuthService;
    private final PasswordChangeService passwordChangeService;

@PostMapping("/register")
@ResponseStatus(HttpStatus.ACCEPTED)
public ResponseEntity<?> register(
    @RequestBody @Validated RegisterationRequest request) throws MessagingException {
    
        service.register(request);
        return ResponseEntity.status(HttpStatus.ACCEPTED).build();
    
    }

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    try {
        var response = comprehensiveAuthService.authenticate(request.getEmail(), request.getPassword());
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }
}

@PostMapping("/change-password")
public ResponseEntity<?> changePassword(@RequestBody PasswordChangeRequest request) {
    try {
        // Validate that new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body("New password and confirm password do not match");
        }
        
        // Get email from the current authenticated user
        // For now, we'll need to get it from the request or token
        // This is a simplified version - in a real app, you'd get the email from the JWT token
        
        // For demonstration, we'll assume the email is passed in the request
        // In a real implementation, you'd extract it from the JWT token
        String email = request.getEmail(); // You'll need to add email field to PasswordChangeRequest
        
        boolean success = passwordChangeService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
        
        if (success) {
            return ResponseEntity.ok("Password changed successfully");
        } else {
            return ResponseEntity.badRequest().body("Current password is incorrect");
        }
    } catch (Exception e) {
        return ResponseEntity.badRequest().body("Password change failed: " + e.getMessage());
    }
}

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(ex.getMessage());
    }

}
