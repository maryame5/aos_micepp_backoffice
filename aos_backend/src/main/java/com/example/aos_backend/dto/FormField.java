package com.example.aos_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class FormField {
    private String id;
    private String name;
    private String type; // text, email, tel, number, date, select, textarea
    private String label;
    private String placeholder;
    private Boolean required;
    private List<String> options;
}
