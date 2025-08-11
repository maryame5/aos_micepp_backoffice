package com.example.aos_backend;

import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;

import com.example.aos_backend.Repository.RoleRepository;
import com.example.aos_backend.user.Role;

@SpringBootApplication
@EnableAsync
@EnableJpaAuditing
public class AosBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(AosBackendApplication.class, args);
	}



}
