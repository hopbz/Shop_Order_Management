package com.example.shop.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CreateOrderItemRequest {
    @NotNull(message = "Id sản phẩm không được null")
    private Long productId;

    @NotNull(message = "Số lượng không được null")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
}
