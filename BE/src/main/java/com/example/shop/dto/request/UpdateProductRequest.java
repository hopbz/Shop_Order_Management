package com.example.shop.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Getter
@Setter
public class UpdateProductRequest {
    @NotBlank(message = "Tên sản phẩm không được rỗng")
    private String name;

    @NotNull
    @DecimalMin(value = "0.01", message = "Giá phải lớn hơn 0")
    private BigDecimal price;

    @NotNull
    @Min(value = 0, message = "Số lượng không được âm")
    private Integer stockQuantity;

    @NotBlank(message = "Trạng thái không được rỗng")
    @Pattern(regexp = "^(ACTIVE|INACTIVE)$", message = "Status chỉ được là ACTIVE hoặc INACTIVE")
    private String status;
}
