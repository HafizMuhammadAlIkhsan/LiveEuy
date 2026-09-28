package com.liveeuy.catalog_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "persons")
@Getter
@Setter
public class Person {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String name;
    
    private String profileImageUrl;
    
    @Column(columnDefinition = "TEXT")
    private String biography;
}
