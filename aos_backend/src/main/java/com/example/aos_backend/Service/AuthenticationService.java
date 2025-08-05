package com.example.aos_backend.Service;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.token.SecureRandomFactoryBean;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.aos_backend.Controller.RegisterationRequest;
import com.example.aos_backend.Repository.RoleRepository;
import com.example.aos_backend.Repository.TokenRepository;
import com.example.aos_backend.Repository.UserRepository;
import com.example.aos_backend.user.Token;
import com.example.aos_backend.user.User;

import jakarta.mail.MessagingException;
import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.beans.factory.annotation.Value;
import java.time.LocalDateTime;
import java.security.SecureRandom;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuthenticationService {
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final TokenRepository tokenRepository;
    private final EmailService emailService;
    private final UserManagementService userManagementService;
    @Value("${application.mailing.frontend.activation-url}")
    private String activationUrl;

    @Transactional
    public void register(RegisterationRequest request) throws MessagingException {
        // UserManagementService to register the user based on role
        userManagementService.registerUser(request);
        
        
        // You might want to modify this logic based on your requirements
        if ("USER".equalsIgnoreCase(request.getRole())) {
            var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found after registration"));
            sendValidationEmail(user);
        }
        // If you want to handle other roles, you can add more conditions here
        else if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            var admin = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Admin not found after registration"));
            sendValidationEmail(admin);
        }
        else if ("SUPPORT".equalsIgnoreCase(request.getRole())) {
            var support = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Support not found after registration"));
            sendValidationEmail(support);
        }
    }

    private void sendValidationEmail(User user) throws MessagingException { 
          var  newtoken = generateAndSaveActivationToken(user); 
        // Logic to send email with the activation token
        System.out.println("Activation email sent to " + user.getEmail() + " with token: " + newtoken);
        emailService.sendEmail(
            user.getEmail(),
            user.fullname(),
            EmailTemplateName.WELCOME_EMAIL,
            activationUrl,
            newtoken,
            "Account Activation"

        );






        
    }

    private String generateAndSaveActivationToken(User user) {
        String generatedToken = generateActivationCode(6);
        var token = Token.builder()
            .token(generatedToken)
            .createdAt(LocalDateTime.now())
            .expiresAt(LocalDateTime.now().plusMinutes(15))
            .user(user)
            .build();
        tokenRepository.save(token);
      
        return generatedToken;
    }

    private String generateActivationCode(int i) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder codeBuilder = new StringBuilder();
        SecureRandom random = new SecureRandom();
        for (int j = 0; j < i; j++) {
            int randomIndex = random.nextInt(characters.length());
            codeBuilder.append(characters.charAt(randomIndex));
        }
        return codeBuilder.toString();
    


        

          }

}
