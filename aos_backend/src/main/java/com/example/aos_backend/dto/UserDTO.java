package com.example.aos_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserDTO {
    private Integer id;
    private String firstname;
    private String lastname;
    private String email;
    private String role;
    private boolean usingTemporaryPassword;
    private String phone;
    private String cin;
    private String matricule;
    private String department;
    private boolean enabled;

}
