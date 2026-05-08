package com.example.shop.dto.response;

import com.example.shop.entity.Product;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class ProductResponse {
    private Long id;
    private String name;
    private BigDecimal price;
    private Integer stockQuantity;
    private String status;
    private boolean deleted;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ProductResponse from(Product p) {
        ProductResponse r = new ProductResponse();
        r.setId(p.getId());
        r.setName(p.getName());
        r.setPrice(p.getPrice());
        r.setStockQuantity(p.getStockQuantity());
        r.setStatus(p.getStatus());
        r.setDeleted(p.isDeleted());
        r.setCreatedAt(p.getCreatedAt());
        r.setUpdatedAt(p.getUpdatedAt());
        return r;
    }
}
