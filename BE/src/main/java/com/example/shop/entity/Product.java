package com.example.shop.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "products")
public class Product extends BaseEntity {
    private String name;
    private BigDecimal price;
    private Integer stockQuantity;
    private String status;

    @Column(nullable = false, columnDefinition = "TINYINT(1) DEFAULT 0")
    private boolean deleted = false;
}
