package com.example.aos_backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Builder
@Data
@AllArgsConstructor
@NoArgsConstructor
public class DocumentJustificatifDto {

    private Long id;
    private String fileName;
    private String contentType;
    private LocalDateTime uploadedAt;
}
