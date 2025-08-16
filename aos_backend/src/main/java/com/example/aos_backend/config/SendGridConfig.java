package com.example.aos_backend.config;

import com.sendgrid.SendGrid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SendGridConfig {
    @Bean
    public SendGrid sendGrid(@Value("${SENDGRID_API_KEY}") String apiKey) {
        if (apiKey == null || apiKey.isEmpty()) {
            throw new IllegalArgumentException("SENDGRID_API_KEY is not set or empty");
        }
        return new SendGrid(apiKey);
    }
}