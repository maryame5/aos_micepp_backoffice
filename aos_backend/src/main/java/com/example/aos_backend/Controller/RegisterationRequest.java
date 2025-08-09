package com.example.aos_backend.Controller;

import java.util.List;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;


@Builder
@Setter
@Getter

public class RegisterationRequest {
    @NotEmpty(message = "First name is required")
    @NotBlank(message = "First name cannot be blank")
    private String firstname;

    @NotEmpty(message = "Last name is required")
    @NotBlank(message = "Last name cannot be blank")
    private String lastname;

    @NotEmpty(message = "Email is required")
    @NotBlank(message = "Email cannot be blank")
    @Email(message = "Email should be valid")
    private String email;

    @NotEmpty(message = "CIN is required")
    @NotBlank(message = "CIN cannot be blank")
    private String cin;

    @NotEmpty(message = "Phone number is required")
    @NotBlank(message = "Phone number cannot be blank")
    private String phone;

    @NotEmpty(message = "Matricule is required")
    @NotBlank(message = "Matricule cannot be blank")
    private String matricule;

    @NotEmpty(message = "Role is required")
    @NotBlank(message = "Role cannot be blank")
    private String role; // e.g., "AGENT", "ADMIN", "SUPPORT"
}