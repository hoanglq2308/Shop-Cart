package com.shopcart.entity;

import java.util.List;

import org.hibernate.annotations.Collate;

import jakarta.annotation.Generated;
import jakarta.persistence.*;


@Entity
@Table(name = "users")
public class User {
  
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Order> orders;
    @OneToOne(mappedBy = "user", cascade = CascadeType.ALL)
    private Cart cart;

    @Column(name = "full_name", nullable = false)
    private String fullName;
    @Column(name = "email", nullable = false, unique = true)
    private String email;
    @Column(length = 20, nullable = false)
    private String password;
    
}
