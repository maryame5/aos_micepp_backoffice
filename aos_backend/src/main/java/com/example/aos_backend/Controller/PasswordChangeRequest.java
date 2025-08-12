package com.example.aos_backend.Controller;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.*;
import lombok.NoArgsConstructor;

@Data
@Builder
@Setter
@Getter
@AllArgsConstructor
@NoArgsConstructor
public class PasswordChangeRequest {

    @NotEmpty(message = "Current password is required")
    @NotBlank(message = "Current password cannot be blank")
    private String currentPassword;

    @NotEmpty(message = "New password is required")
    @NotBlank(message = "New password cannot be blank")
    @Size(min = 8, message = "New password must be at least 8 characters long")
    private String newPassword;

    @NotEmpty(message = "Confirm password is required")
    @NotBlank(message = "Confirm password cannot be blank")
    private String confirmPassword;
}