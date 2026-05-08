package com.example.shop.dto.request;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateOrderStatusRequest {
    @NotBlank(message = "Status không được rỗng")
    @Pattern(regexp = "^(PENDING|CONFIRMED|SHIPPING|COMPLETED|CANCELED)$", message = "Status không hợp lệ")
    private String status;
}