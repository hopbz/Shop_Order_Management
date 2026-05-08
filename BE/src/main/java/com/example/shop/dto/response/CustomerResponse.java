package com.example.shop.dto.response;

import com.example.shop.entity.Customer;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Getter
@Setter
public class CustomerResponse {
    private Long id;
    private String fullName;
    private String phone;
    private String email;
    private String address;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CustomerResponse from(Customer c) {
        CustomerResponse r = new CustomerResponse();
        r.setId(c.getId());
        r.setFullName(c.getFullName());
        r.setPhone(c.getPhone());
        r.setEmail(c.getEmail());
        r.setAddress(c.getAddress());
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }
}
