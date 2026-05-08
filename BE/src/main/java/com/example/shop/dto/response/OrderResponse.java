package com.example.shop.dto.response;

import com.example.shop.entity.Order;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
public class OrderResponse {
    private Long id;
    private Long customerId;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;

    public static OrderResponse from(Order o) {
        OrderResponse r = new OrderResponse();
        r.setId(o.getId());
        r.setCustomerId(o.getCustomerId());
        r.setTotalAmount(o.getTotalAmount());
        r.setStatus(o.getStatus());
        r.setCreatedAt(o.getCreatedAt());
        r.setUpdatedAt(o.getUpdatedAt());
        return r;
    }
}