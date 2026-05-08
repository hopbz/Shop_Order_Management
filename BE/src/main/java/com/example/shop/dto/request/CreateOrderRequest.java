package com.example.shop.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateOrderRequest {

    @NotNull(message = "Mã khách hàng không được null")
    private Long customerId;

    @NotNull(message = "Danh sách sản phẩm không được null")
    @NotEmpty(message = "Danh sách sản phẩm không được rỗng")
    @Valid
    private List<CreateOrderItemRequest> items;
}
