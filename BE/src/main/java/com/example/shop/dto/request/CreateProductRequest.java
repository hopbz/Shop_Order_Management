package com.example.shop.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class CreateProductRequest {
    @NotBlank(message = "Tên sản phẩm không được rỗng")
    private String name;

    @NotNull(message = "Giá không được null")
    @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    @NotNull(message = "Số lượng không được null")
    @Min(value = 0, message = "Số lượng tồn kho không được âm")
    private Integer stockQuantity;
}