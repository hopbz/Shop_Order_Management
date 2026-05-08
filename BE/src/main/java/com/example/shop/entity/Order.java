package com.example.shop.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.EqualsAndHashCode;
import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = false)
@Entity
@Table(name = "orders")
public class Order extends BaseEntity {
    private Long customerId;
    private BigDecimal totalAmount;
    private String status;
}
