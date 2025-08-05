package com.example.aos_backend.Service;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;



import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EmailService {
    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    @Async
    public void sendEmail(String to,
     String username,
      EmailTemplateName emailTemplate,
        String confirmationUrl,
       String activationCode,
       String subject) throws MessagingException {
        String templateName;

        if(emailTemplate== null){
            templateName = "confirmation_email";
        } else {
            templateName = emailTemplate.getName().toLowerCase();
        }
        
        System.out.println("Email template enum: " + emailTemplate);
        System.out.println("Email template name: " + templateName);


        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED, StandardCharsets.UTF_8.name());
        Map<String, Object> properties = new HashMap<>();
        properties.put("username", username);
        properties.put("confirmationUrl", confirmationUrl);
        properties.put("activationCode", activationCode);
        
        // Add additional properties for welcome email
        if (emailTemplate == EmailTemplateName.WELCOME_EMAIL) {
            properties.put("fullName", username);
            properties.put("email", to);
            properties.put("role", activationCode); // Using activationCode field for role
            properties.put("temporaryPassword", confirmationUrl); // Using confirmationUrl field for password
        }

        Context context = new Context();
        context.setVariables(properties);

        helper.setFrom("elkhalfimaryame@gmail.com");
        helper.setTo(to);
        helper.setSubject(subject);

        String template = templateEngine.process(templateName, context);

        helper.setText(template, true);
        mailSender.send(message);

        System.out.println("Email sent to " + to + " with subject: " + subject);
        System.out.println("Email template used: " + templateName);
        System.out.println("Email content: " + template);
        System.out.println("Email sent successfully.");
        System.out.println("Email properties: " + properties);
        System.out.println("From email: contact@aos_Micepp.com");
        System.out.println("To email: " + to);


    }

}
