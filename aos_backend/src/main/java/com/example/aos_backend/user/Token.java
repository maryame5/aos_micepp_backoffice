package com.example.aos_backend.user;


import java.time.LocalDateTime;
import jakarta.persistence.*;
import jakarta.persistence.GenerationType;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "token")
public class Token {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String token;
    private LocalDateTime createdAt ;
    private LocalDateTime expiresAt;
    private LocalDateTime validatedAt;
    
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

}
