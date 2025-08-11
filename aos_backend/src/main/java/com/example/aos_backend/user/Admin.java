package com.example.aos_backend.user;

import java.util.List;
import java.util.Set;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "admin")
public class Admin {

   @Id
   @GeneratedValue(strategy = GenerationType.IDENTITY)
   private Integer id;

   @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Utilisateur utilisateur;
    
    @OneToMany(mappedBy = "publishedBy")
    private List<DocumentPublic> publishedDocuments;
    
	@OneToMany(mappedBy = "handledBy")
    private List<MessageContact> handledMessages;

 


}