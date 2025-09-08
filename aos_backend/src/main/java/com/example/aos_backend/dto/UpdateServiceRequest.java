package com.example.aos_backend.dto;

import lombok.Data;
import java.util.List;

import jakarta.validation.constraints.*;

@Data
public class UpdateServiceRequest {
    @NotBlank(message = "Le nom du service est obligatoire")
    private String nom;

    @NotBlank(message = "L'icône est obligatoire")
    private String icon;

    @NotBlank(message = "Le titre est obligatoire")
    private String title;

    @NotBlank(message = "La description est obligatoire")
    private String description;

    @NotNull(message = "Les fonctionnalités sont obligatoires")
    private List<String> features;
}