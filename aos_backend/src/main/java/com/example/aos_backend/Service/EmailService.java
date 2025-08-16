package com.example.aos_backend.Service;

import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {
    private final SendGrid sendGrid;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.sender:melkhalfi@insea.ac.ma}") // Fallback to your email; configure in application.yml
    private String fromEmail;

    @Async
    public void sendEmail(
        String to,
        String username,
        EmailTemplateName emailTemplate,
        String confirmationUrl,
        String activationCode,
        String subject,
        String role
    ) throws IOException {
        String templateName = emailTemplate == null ? "welcome_email" : emailTemplate.getName().toLowerCase();

        // Prepare Thymeleaf context for templating
        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("confirmationUrl", confirmationUrl);
        properties.put("activationCode", activationCode);
        
        // Add specific variables for welcome email template
        if (emailTemplate == EmailTemplateName.WELCOME_EMAIL) {
            properties.put("fullName", username);
            properties.put("email", to);
            properties.put("role", role != null ? role : "USER");
            properties.put("temporaryPassword", activationCode);
        }
        // Add specific variables for password reset template

        Context context = new Context();
        context.setVariables(properties);

        // Render HTML template
        String htmlContent = templateEngine.process(templateName, context);

        // Configure SendGrid email
        Email from = new Email(fromEmail); // Must be verified in SendGrid
        Email toEmail = new Email(to);
        Content content = new Content("text/html", htmlContent);
        Mail mail = new Mail(from, subject, toEmail, content);

        // Send email via SendGrid API
        Request request = new Request();
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            Response response = sendGrid.api(request);
            log.info("Email sent to {}. SendGrid response: {} {}", to, response.getStatusCode(), response.getBody());
        } catch (IOException ex) {
            log.error("Failed to send email to {}", to, ex);
            throw ex;
        }
    }
}