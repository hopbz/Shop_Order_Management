package com.example.shop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "customers")
public class Customer extends BaseEntity {
    private String fullName;
    private String phone;
    private String email;
    private String address;
}
