// ServiceDTO.java - DTO unifié qui combine ServiceEntity et ServiceInfo
package com.example.aos_backend.dto;

import com.example.aos_backend.dto.FormField;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ServiceDTO {
    private Long id;
    private String nom;
    private String type;
    private String icon;
    private String title;
    private String description;
    private List<String> features;
    private Boolean isActive;
    private List<FormField> formFields;
    private List<String> requiredDocuments;
}
