package com.example.aos_backend.user;

import java.util.List;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.*;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "support")
public class Support   {

    @Id
    private Integer id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "id")
    private Utilisateur utilisateur;
    
@OneToMany(mappedBy = "publishedBySupport")
private List<DocumentPublic> documentsPublics;


    public void addDocumentPublic(DocumentPublic document) {
        documentsPublics.add(document);
    }

    public void removeDocumentPublic(DocumentPublic document) {
        documentsPublics.remove(document);
    }
}