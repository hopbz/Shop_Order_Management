package com.example.shop.dto.response;

import com.example.shop.entity.OrderItem;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class OrderItemResponse {
    private Long id;
    private Long productId;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal lineTotal;

    public static OrderItemResponse from(OrderItem oi) {
        OrderItemResponse r = new OrderItemResponse();
        r.setId(oi.getId());
        r.setProductId(oi.getProductId());
        r.setQuantity(oi.getQuantity());
        r.setUnitPrice(oi.getUnitPrice());
        r.setLineTotal(oi.getLineTotal());
        return r;
    }
}