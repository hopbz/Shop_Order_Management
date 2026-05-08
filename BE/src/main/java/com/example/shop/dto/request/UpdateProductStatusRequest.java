package com.example.shop.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProductStatusRequest {

    @NotBlank(message = "Trạng thái không được rỗng")
    @Pattern(regexp = "^(ACTIVE|INACTIVE)$", message = "Status chỉ được là ACTIVE hoặc INACTIVE")
    private String status;
}
