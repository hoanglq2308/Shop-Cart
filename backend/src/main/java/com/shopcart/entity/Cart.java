package com.shopcart.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "carts")

public class Cart{ 
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private long id;
@OneToMany(mappedBy = "cart", cascade = CascadeType.ALL)
private java.util.List<CartItem> cartItems;
@OneToOne
@JoinColumn(name = "user_id", referencedColumnName = "id", nullable = false)
private User user;
}
