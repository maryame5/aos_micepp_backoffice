package com.example.aos_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentPublicDTO {
    private Long id;
    private String titre;
    private String description;
    private String contentType;
    private String fileName;
    private String type;
    private String publishedByName;
    private LocalDateTime createdDate;
    private LocalDateTime uploadedAt;
    private boolean published;
}
