package com.example.shop.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shop.entity.Customer;

public interface CustomerRepository extends JpaRepository<Customer, Long> {
    boolean existsByEmail(String email);
}
