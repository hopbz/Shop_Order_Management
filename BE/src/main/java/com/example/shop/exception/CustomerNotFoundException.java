package com.example.shop.exception;

public class CustomerNotFoundException extends RuntimeException {
    public CustomerNotFoundException(Long id) {
        super("không tìm thấy khách hàng với id:" + id);
    }
}